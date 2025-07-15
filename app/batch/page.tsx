'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  Loader2, 
  Download, 
  Eye,
  Trash2,
  RefreshCw 
} from 'lucide-react'
import { toast } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { supabase } from '@/lib/supabase'

interface BatchItem {
  id: string
  prompt: string
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  batchSize: number
  styles: string[]
  totalCost: number
  createdAt: string
  completedAt?: string
  progress: {
    total: number
    completed: number
    failed: number
    processing: number
    pending: number
    percentage: number
  }
  completedImages: Array<{
    id: string
    style: string
    imageUrl: string
    completedAt: string
  }>
}

const styleNames: { [key: string]: string } = {
  natural: '自然风格',
  anime: '动漫风格',
  oil: '油画风格',
  watercolor: '水彩风格',
  pixel: '像素风格',
  ghibli: '吉卜力风格'
}

export default function BatchPage() {
  const [batches, setBatches] = useState<BatchItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null)

  const loadBatches = async () => {
    try {
      setLoading(true)
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch('/api/batch-list?limit=20', {
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })
      if (response.ok) {
        const data = await response.json()
        setBatches(data.data || [])
      } else {
        toast.error('获取批量任务失败')
      }
    } catch (error) {
      console.error('获取批量任务失败:', error)
      toast.error('获取批量任务失败')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBatches()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-500" />
      case 'processing':
        return <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'failed':
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />
      default:
        return null
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '等待中'
      case 'processing':
        return '生成中'
      case 'completed':
        return '已完成'
      case 'failed':
        return '失败'
      case 'cancelled':
        return '已取消'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'outline'
      case 'processing':
        return 'secondary'
      case 'completed':
        return 'default'
      case 'failed':
      case 'cancelled':
        return 'destructive'
      default:
        return 'outline'
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

  const downloadAllImages = async (batch: BatchItem) => {
    for (const image of batch.completedImages) {
      await downloadImage(image.imageUrl, image.style)
      // 添加延迟避免浏览器阻止多个下载
      await new Promise(resolve => setTimeout(resolve, 500))
    }
    toast.success(`已下载${batch.completedImages.length}张图片`)
  }

  const cancelBatch = async (batchId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const response = await fetch(`/api/batch-cancel/${batchId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session?.access_token}`
        }
      })

      if (response.ok) {
        toast.success('批量任务已取消')
        loadBatches() // 重新加载列表
      } else {
        const data = await response.json()
        toast.error(data.error || '取消失败')
      }
    } catch (error) {
      toast.error('取消任务失败')
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('zh-CN')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">加载批量任务中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
              批量生成管理
            </h1>
            <p className="text-gray-600 mt-2">管理您的批量图片生成任务</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={loadBatches}>
              <RefreshCw className="w-4 h-4 mr-2" />
              刷新
            </Button>
            <Link href="/">
              <Button>
                返回首页
              </Button>
            </Link>
          </div>
        </div>

        {batches.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <div className="text-gray-500 mb-4">
                <Loader2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg">暂无批量生成任务</p>
                <p className="text-sm">前往首页开始您的第一个批量生成任务</p>
              </div>
              <Link href="/">
                <Button>
                  开始批量生成
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {batches.map((batch) => (
              <Card key={batch.id} className="overflow-hidden">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(batch.status)}
                        <CardTitle className="text-lg">{batch.prompt}</CardTitle>
                        <Badge variant={getStatusColor(batch.status)}>
                          {getStatusText(batch.status)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-2 text-sm text-gray-600">
                        <span>{batch.batchSize}张图片</span>
                        <span>•</span>
                        <span>{batch.totalCost}积分</span>
                        <span>•</span>
                        <span>{formatDate(batch.createdAt)}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {batch.status === 'completed' && batch.completedImages.length > 0 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadAllImages(batch)}
                        >
                          <Download className="w-4 h-4 mr-1" />
                          下载全部
                        </Button>
                      )}
                      {(batch.status === 'pending' || batch.status === 'processing') && (
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => cancelBatch(batch.id)}
                        >
                          <XCircle className="w-4 h-4 mr-1" />
                          取消
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* 进度条 */}
                  {(batch.status === 'processing' || batch.status === 'completed') && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>进度: {batch.progress.completed}/{batch.progress.total}</span>
                        <span>{batch.progress.percentage}%</span>
                      </div>
                      <Progress value={batch.progress.percentage} className="h-2" />
                      <div className="grid grid-cols-4 gap-4 text-center text-sm">
                        <div>
                          <div className="font-semibold text-green-600">{batch.progress.completed}</div>
                          <div className="text-gray-500">已完成</div>
                        </div>
                        <div>
                          <div className="font-semibold text-blue-600">{batch.progress.processing}</div>
                          <div className="text-gray-500">生成中</div>
                        </div>
                        <div>
                          <div className="font-semibold text-gray-600">{batch.progress.pending}</div>
                          <div className="text-gray-500">等待中</div>
                        </div>
                        <div>
                          <div className="font-semibold text-red-600">{batch.progress.failed}</div>
                          <div className="text-gray-500">失败</div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 风格标签 */}
                  <div className="flex flex-wrap gap-2">
                    {batch.styles.map((style) => (
                      <Badge key={style} variant="outline">
                        {styleNames[style] || style}
                      </Badge>
                    ))}
                  </div>

                  {/* 完成的图片 */}
                  {batch.completedImages.length > 0 && (
                    <div>
                      <h4 className="font-medium mb-3">完成的图片 ({batch.completedImages.length})</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
                        {batch.completedImages.map((image) => (
                          <div key={image.id} className="group relative">
                            <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                              <Image
                                src={image.imageUrl}
                                alt={`${image.style}风格图片`}
                                width={150}
                                height={150}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                              />
                            </div>
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => downloadImage(image.imageUrl, image.style)}
                              >
                                <Download className="w-4 h-4" />
                              </Button>
                            </div>
                            <div className="mt-1 text-center">
                              <Badge variant="outline" className="text-xs">
                                {styleNames[image.style] || image.style}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}