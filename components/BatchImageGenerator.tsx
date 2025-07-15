'use client'

import { useState, useEffect } from 'react'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Card } from './ui/card'
import { Badge } from './ui/badge'
import { Checkbox } from './ui/checkbox'
import { Progress } from './ui/progress'
import { Loader2, Download, X, Eye, Play, Pause } from 'lucide-react'
import { toast } from 'sonner'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'
import { Label } from './ui/label'

interface BatchImageGeneratorProps {
  initialPrompt?: string
}

const imageStyles = [
  {
    id: 'natural',
    name: '自然风格',
    description: '真实世界的自然照片风格，适合写实场景。',
  },
  {
    id: 'anime',
    name: '动漫风格',
    description: '日系动漫、二次元风格，色彩鲜明，线条清晰。',
  },
  {
    id: 'oil',
    name: '油画风格',
    description: '仿油画质感，厚重笔触，艺术感强。',
  },
  {
    id: 'watercolor',
    name: '水彩风格',
    description: '水彩画质感，色彩柔和，边缘晕染。',
  },
  {
    id: 'pixel',
    name: '像素风格',
    description: '像素艺术风格，复古游戏画面效果。',
  },
  {
    id: 'ghibli',
    name: '吉卜力风格',
    description: '宫崎骏动画风格，温暖细腻，充满童话感。',
  },
]

interface BatchStatus {
  id: string
  prompt: string
  status: string
  progress: {
    total: number
    completed: number
    failed: number
    processing: number
    pending: number
    percentage: number
    estimatedTimeRemaining: number
  }
  items: Array<{
    id: string
    style: string
    status: string
    imageUrl?: string
    errorMessage?: string
  }>
}

export function BatchImageGenerator({ initialPrompt }: BatchImageGeneratorProps) {
  const [prompt, setPrompt] = useState(initialPrompt || '')
  const [selectedStyles, setSelectedStyles] = useState<string[]>(['natural'])
  const [loading, setLoading] = useState(false)
  const [currentBatch, setCurrentBatch] = useState<BatchStatus | null>(null)
  const [completedImages, setCompletedImages] = useState<Array<{id: string, style: string, imageUrl: string}>>([])
  const [showBatchHistory, setShowBatchHistory] = useState(false)
  const [batchHistory, setBatchHistory] = useState<any[]>([])

  useEffect(() => {
    if (initialPrompt) {
      setPrompt(initialPrompt)
    }
  }, [initialPrompt])

  // 轮询批量任务状态
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null
    
    if (currentBatch && ['pending', 'processing'].includes(currentBatch.status)) {
      interval = setInterval(async () => {
        try {
          const { data: { session } } = await supabase.auth.getSession()
          const response = await fetch(`/api/batch-status/${currentBatch.id}`, {
            headers: {
              'Authorization': `Bearer ${session?.access_token}`
            }
          })
          if (response.ok) {
            const data = await response.json()
            console.log('批量状态更新:', data)
            
            // 更新批量状态，使用正确的数据结构
            setCurrentBatch({
              id: data.batch.id,
              prompt: data.batch.prompt,
              status: data.batch.status,
              progress: data.progress,
              items: data.items
            })
            
            // 更新完成的图片，注意API返回的是imageUrl而不是image_url
            const completed = data.items.filter((item: any) => item.status === 'completed' && item.imageUrl)
            console.log('完成的图片:', completed)
            setCompletedImages(completed)
            
            // 如果任务完成，停止轮询
            if (data.batch.status === 'completed' || data.batch.status === 'failed') {
              setLoading(false)
              if (interval) clearInterval(interval)
              
              if (data.batch.status === 'completed') {
                toast.success(`批量生成完成！共生成${data.progress.completed}张图片`)
              } else {
                toast.error('批量生成失败')
              }
            }
          } else if (response.status === 401) {
            console.error('认证失败，停止轮询')
            toast.error('登录状态已过期，请刷新页面')
            setLoading(false)
            if (interval) clearInterval(interval)
          } else {
            console.error('获取批量状态失败:', response.status, response.statusText)
          }
        } catch (error) {
          console.error('获取批量状态失败:', error)
        }
      }, 3000) // 每3秒检查一次
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [currentBatch])

  const checkCredits = async (requiredCredits: number) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!user || !session) {
      toast.error('请先登录')
      return false
    }
    
    const res = await fetch(`/api/credits?userId=${user.id}`, {
      headers: {
        'Authorization': `Bearer ${session.access_token}`
      }
    })
    const data = await res.json()
    if (data.credits === undefined) {
      toast.error('无法获取积分信息')
      return false
    }
    if (data.credits < requiredCredits) {
      toast.error(`积分不足，需要${requiredCredits}积分，当前只有${data.credits}积分`)
      return false
    }
    return true
  }

  const handleStyleChange = (styleId: string, checked: boolean) => {
    if (checked) {
      setSelectedStyles(prev => [...prev, styleId])
    } else {
      setSelectedStyles(prev => prev.filter(id => id !== styleId))
    }
  }

  const generateBatchImages = async () => {
    if (!prompt.trim()) {
      toast.error('请输入提示词')
      return
    }

    if (selectedStyles.length === 0) {
      toast.error('请至少选择一种风格')
      return
    }

    const requiredCredits = selectedStyles.length * 10
    const enough = await checkCredits(requiredCredits)
    if (!enough) return

    try {
      setLoading(true)
      setCurrentBatch(null)
      setCompletedImages([])
      
      const { data: { user } } = await supabase.auth.getUser()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!user || !session) {
        toast.error('请先登录')
        return
      }

      const response = await fetch('/api/batch-generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          prompt,
          styles: selectedStyles
        })
      })

      const data = await response.json()

      if (!response.ok) {
        // 处理不同类型的错误
        switch (data.code) {
          case 'NSFW_DETECTED':
            toast.error('内容检测提醒', {
              description: '生成的内容被检测为不适合的内容，请尝试使用不同的描述或更温和的词汇'
            });
            return;
            
          case 'SERVICE_UNAVAILABLE':
            toast.error('服务暂时不可用', {
              description: 'AI图片生成服务暂时不可用，请稍后再试'
            });
            return;
            
          case 'TIMEOUT':
            toast.error('请求超时', {
              description: '批量生成请求超时，请重试'
            });
            return;
            
          default:
            break;
        }
        
        // 处理积分相关错误
        if (response.status === 403 && data.error?.includes('积分不足')) {
          toast.error('积分不足，无法生成图片，请先充值');
          return;
        }
        
        // 处理服务不可用错误
        if (response.status === 503) {
          toast.error('服务暂时不可用', {
            description: 'AI图片生成服务暂时不可用，请稍后再试'
          });
          return;
        }
        
        // 处理超时错误
        if (response.status === 408) {
          toast.error('请求超时', {
            description: '批量生成请求超时，请重试'
          });
          return;
        }
        
        throw new Error(data.error || '批量生成失败')
      }

      toast.success(data.message)
      
      // 开始监控批量任务
      setCurrentBatch({
        id: data.batchId,
        prompt,
        status: 'pending',
        progress: {
          total: selectedStyles.length,
          completed: 0,
          failed: 0,
          processing: 0,
          pending: selectedStyles.length,
          percentage: 0,
          estimatedTimeRemaining: data.estimatedTime
        },
        items: selectedStyles.map(style => ({
          id: '',
          style,
          status: 'pending'
        }))
      })
      
      console.log('批量任务已创建，ID:', data.batchId)
      console.log('选择的风格:', selectedStyles)

    } catch (error: any) {
      setLoading(false)
      toast.error(error.message || '批量生成失败')
    }
  }

  const cancelBatch = async () => {
    if (!currentBatch) return

    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/batch-cancel/${currentBatch.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (response.ok) {
        toast.success('批量任务已取消')
        setCurrentBatch(null)
        setLoading(false)
      }
    } catch (error) {
      toast.error('取消任务失败')
    }
  }

  const downloadImage = async (imageUrl: string, style: string) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `batch-${style}-${Date.now()}.png`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast.error('下载失败')
    }
  }

  const downloadAllImages = async () => {
    for (const image of completedImages) {
      await downloadImage(image.imageUrl, image.style)
      // 添加延迟避免浏览器阻止多个下载
      await new Promise(resolve => setTimeout(resolve, 500))
    }
  }

  const loadBatchHistory = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/batch-list?limit=10', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setBatchHistory(data.data || [])
      }
    } catch (error) {
      console.error('获取批量历史失败:', error)
    }
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${seconds}秒`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}分钟`
    return `${Math.floor(seconds / 3600)}小时${Math.floor((seconds % 3600) / 60)}分钟`
  }

  return (
    <div className="space-y-6">
      {/* 批量生成控制面板 */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              批量图片生成
            </h3>
            <Badge variant="secondary">
              {selectedStyles.length}种风格 • {selectedStyles.length * 10}积分
            </Badge>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="batch-prompt" className="text-sm font-medium mb-2 block">
                描述您想要生成的图片
              </Label>
              <Input
                id="batch-prompt"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="例如：一只可爱的小猫，坐在花园里..."
                disabled={loading}
                className="w-full"
              />
            </div>

            <div>
              <Label className="text-sm font-medium mb-3 block">
                选择图片风格（可多选）
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {imageStyles.map((style) => (
                  <div key={style.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={style.id}
                      checked={selectedStyles.includes(style.id)}
                      onCheckedChange={(checked) => handleStyleChange(style.id, checked as boolean)}
                      disabled={loading}
                    />
                    <Label 
                      htmlFor={style.id}
                      className="text-sm cursor-pointer hover:text-blue-600"
                      title={style.description}
                    >
                      {style.name}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={generateBatchImages}
                disabled={loading || selectedStyles.length === 0 || !prompt.trim()}
                className="flex-1"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    生成中...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    开始批量生成
                  </>
                )}
              </Button>
              
              {loading && currentBatch && (
                <Button variant="destructive" onClick={cancelBatch}>
                  <X className="w-4 h-4 mr-2" />
                  取消
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* 批量任务进度 */}
      {currentBatch && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">批量生成进度</h4>
              <Badge variant={
                currentBatch.status === 'completed' ? 'default' :
                currentBatch.status === 'processing' ? 'secondary' :
                currentBatch.status === 'failed' ? 'destructive' : 'outline'
              }>
                {currentBatch.status === 'pending' && '等待中'}
                {currentBatch.status === 'processing' && '生成中'}
                {currentBatch.status === 'completed' && '已完成'}
                {currentBatch.status === 'failed' && '失败'}
              </Badge>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>进度：{currentBatch.progress.completed}/{currentBatch.progress.total}</span>
                <span>{currentBatch.progress.percentage}%</span>
              </div>
              <Progress value={currentBatch.progress.percentage} className="w-full" />
              {currentBatch.progress.estimatedTimeRemaining > 0 && (
                <p className="text-sm text-gray-500">
                  预计剩余时间：{formatTime(currentBatch.progress.estimatedTimeRemaining)}
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-green-600">{currentBatch.progress.completed}</div>
                <div className="text-sm text-gray-500">已完成</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">{currentBatch.progress.processing}</div>
                <div className="text-sm text-gray-500">生成中</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-600">{currentBatch.progress.failed}</div>
                <div className="text-sm text-gray-500">失败</div>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* 完成的图片展示 */}
      {completedImages.length > 0 && (
        <Card className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">生成完成的图片</h4>
              <Button onClick={downloadAllImages} variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                下载全部
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedImages.map((image) => (
                <div key={image.id} className="group relative">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image
                      src={image.imageUrl}
                      alt={`${image.style}风格图片`}
                      width={300}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => downloadImage(image.imageUrl, image.style)}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 text-center">
                    <Badge variant="outline">{imageStyles.find(s => s.id === image.style)?.name}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}