'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HistoryIcon, LogOut } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);
      // 获取积分余额
      try {
        const response = await fetch(`/api/credits?userId=${user.id}`)
        const data = await response.json()
        setCredits(data.credits)
        if (data.credits < 10) {
          console.log('当前积分：', data.credits);
          toast.error('积分不足，无法生成图片，请先充值');
        }
      } catch (error) {
        console.error('获取积分失败:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchUserData()
  }, [router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('userId')
    router.push('/login')
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold">个人资料</h1>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            退出登录
          </Button>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">邮箱</label>
                  <p className="font-medium">{user?.email || '未知'}</p>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">注册时间</label>
                  <p className="font-medium">
                    {user?.created_at
                      ? new Date(user.created_at).toLocaleString()
                      : '未知'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>积分信息</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground">当前积分</label>
                  <p className="text-2xl font-bold">{credits}</p>
                </div>
                <div className="flex gap-4">
                  <Button asChild>
                    <Link href="/recharge">
                      充值积分
                    </Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/history">
                      <HistoryIcon className="h-4 w-4 mr-2" />
                      使用记录
                    </Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 