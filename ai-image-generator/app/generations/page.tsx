'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, RefreshCw, AlertCircle, Trash2 } from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

interface GenerationHistory {
  id: string
  user_id: string
  prompt: string
  image_url: string
  parameters: {
    size: string
    quality: string
    style: string
  }
  created_at: string
}

export default function GenerationsPage() {
  const [user, setUser] = useState<any>(null)
  const [history, setHistory] = useState<GenerationHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set())
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError) {
          console.error('获取用户信息失败:', userError);
          setError('获取用户信息失败，请重新登录');
          router.push('/login');
          return;
        }
        if (!user) {
          setError('请先登录');
          router.push('/login');
          return;
        }
        setUser(user);
        await fetchHistory(user.id);
      } catch (err) {
        console.error('初始化失败:', err);
        setError('系统错误，请稍后重试');
      }
    }
    fetchData()
  }, [router])

  const fetchHistory = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);
      
      if (!userId) {
        setError('用户ID无效，请重新登录');
        router.push('/login');
        return;
      }

      const { data, error } = await supabase
        .from('generation_history')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('获取生成历史失败:', error);
        if (error.code === '42P01') {
          setError('数据库表不存在，请联系管理员');
        } else if (error.code === '42501') {
          setError('没有权限访问历史记录');
        } else {
          setError('获取生成历史失败: ' + error.message);
        }
        return;
      }

      setHistory(data || []);
    } catch (err) {
      console.error('获取生成历史失败:', err);
      setError('系统错误，请稍后重试');
    } finally {
      setLoading(false);
    }
  }

  const handleDownload = (imageUrl: string) => {
    try {
      const link = document.createElement('a')
      link.href = imageUrl
      link.download = `ai-image-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      toast.success('图片已开始下载')
    } catch (err) {
      console.error('下载图片失败:', err);
      toast.error('下载图片失败，请稍后重试');
    }
  }

  const handleRegenerate = async (prompt: string) => {
    router.push(`/?prompt=${encodeURIComponent(prompt)}`)
  }

  const handleImageError = (imageId: string) => {
    setImageErrors(prev => new Set(prev).add(imageId))
  }

  const handleDeleteRecord = async (recordId: string) => {
    if (!confirm('确定要删除这条记录吗？')) {
      return
    }

    try {
      const { error } = await supabase
        .from('generation_history')
        .delete()
        .eq('id', recordId)

      if (error) {
        toast.error('删除失败: ' + error.message)
        return
      }

      // 从本地状态中移除
      setHistory(prev => prev.filter(item => item.id !== recordId))
      toast.success('记录已删除')
    } catch (error) {
      console.error('删除记录失败:', error)
      toast.error('删除记录时发生错误')
    }
  }

  const handleRefresh = async () => {
    if (user?.id) {
      await fetchHistory(user.id);
    } else {
      setError('用户未登录，请重新登录');
      router.push('/login');
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-muted-foreground">加载中...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Button>
        </div>
        <div className="bg-destructive/10 text-destructive p-4 rounded-md">
          <p className="font-medium">错误</p>
          <p className="mt-1">{error}</p>
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="mt-4"
          >
            重试
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            返回首页
          </Button>
          <Button
            variant="outline"
            onClick={handleRefresh}
            className="flex items-center gap-2 border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
          >
            <RefreshCw className="h-4 w-4" />
            刷新
          </Button>
        </div>

        {/* Page Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            我的创作历史
          </h1>
          <p className="text-xl text-muted-foreground">
            查看您的AI艺术作品集合
          </p>
        </div>

        {/* Stats */}
        {history.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">{history.length}</div>
                <div className="text-sm text-muted-foreground">总生成数量</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {new Set(history.map(item => item.parameters?.style || 'natural')).size}
                </div>
                <div className="text-sm text-muted-foreground">使用风格数</div>
              </CardContent>
            </Card>
            <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-xl border-0 shadow-lg">
              <CardContent className="p-6 text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {history.length > 0 ? Math.ceil((Date.now() - new Date(history[history.length - 1].created_at).getTime()) / (1000 * 60 * 60 * 24)) : 0}
                </div>
                <div className="text-sm text-muted-foreground">创作天数</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {history.map((item, index) => (
            <Card 
              key={item.id} 
              className="group overflow-hidden bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105"
            >
              <div className="relative">
                <div className="relative aspect-square w-full overflow-hidden">
                  {imageErrors.has(item.id) ? (
                    // 显示错误状态
                    <div className="w-full h-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                      <div className="text-center p-4">
                        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-2" />
                        <p className="text-sm text-red-600 dark:text-red-400 mb-3">图片加载失败</p>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteRecord(item.id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          <Trash2 className="h-3 w-3 mr-1" />
                          删除记录
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Image
                        src={item.image_url}
                        alt={item.prompt}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-110"
                        onError={() => handleImageError(item.id)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      {/* Style Badge */}
                      <div className="absolute top-3 left-3">
                        <span className="px-2 py-1 bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-full text-xs font-medium">
                          {item.parameters?.style === 'anime' ? '动漫' :
                           item.parameters?.style === 'oil' ? '油画' :
                           item.parameters?.style === 'watercolor' ? '水彩' :
                           item.parameters?.style === 'pixel' ? '像素' :
                           item.parameters?.style === 'ghibli' ? '吉卜力' :
                           '自然'}
                        </span>
                      </div>

                      {/* Action Buttons - Show on Hover */}
                      <div className="absolute bottom-3 left-3 right-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <Button
                          size="sm"
                          onClick={() => handleRegenerate(item.prompt)}
                          className="flex-1 bg-purple-600 hover:bg-purple-700 text-white border-0 backdrop-blur-sm"
                        >
                          <RefreshCw className="h-3 w-3 mr-1" />
                          重新生成
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleDownload(item.image_url)}
                          className="bg-white/90 hover:bg-white text-gray-900 border-0 backdrop-blur-sm"
                        >
                          <Download className="h-3 w-3" />
                        </Button>
                      </div>
                    </>
                  )}
                </div>
              </div>
              
              <CardContent className="p-4">
                <div className="mb-3">
                  <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
                    {item.prompt}
                  </h3>
                  <div className="text-xs text-muted-foreground">
                    {new Date(item.created_at).toLocaleDateString('zh-CN', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {history.length === 0 && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                <ArrowLeft className="h-6 w-6 text-white rotate-180" />
              </div>
            </div>
            <h3 className="text-xl font-semibold text-muted-foreground mb-2">还没有创作记录</h3>
            <p className="text-muted-foreground mb-6">开始您的第一次AI创作吧！</p>
            <Button 
              onClick={() => router.push('/')}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
            >
              开始创作
            </Button>
          </div>
        )}
      </div>
    </div>
  )
} 