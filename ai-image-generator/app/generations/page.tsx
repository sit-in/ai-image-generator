'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Download, RefreshCw } from 'lucide-react'
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
        <Button
          variant="outline"
          onClick={handleRefresh}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          刷新
        </Button>
      </div>

      <h1 className="text-3xl font-bold mb-8">生成历史</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {history.map((item) => (
          <Card key={item.id} className="overflow-hidden">
            <CardHeader>
              <CardTitle className="text-lg line-clamp-2">{item.prompt}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative aspect-square w-full overflow-hidden rounded-lg mb-4">
                <Image
                  src={item.image_url}
                  alt={item.prompt}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleRegenerate(item.prompt)}
                >
                  重新生成
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(item.image_url)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  下载
                </Button>
              </div>
              <div className="mt-2 text-sm text-muted-foreground">
                {new Date(item.created_at).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {history.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">暂无生成历史</p>
        </div>
      )}
    </div>
  )
} 