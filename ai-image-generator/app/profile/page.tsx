'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { HistoryIcon, LogOut, Copy, KeyRound } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
  const [credits, setCredits] = useState(0)
  const [loading, setLoading] = useState(true)
  const [isAdmin, setIsAdmin] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const fetchUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/login');
        return;
      }
      setUser(user);

      // 获取管理员状态
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single()
        
        setIsAdmin(profile?.is_admin || false)
      } catch (error) {
        console.error('获取管理员状态失败:', error)
      }

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

  const copyUserId = () => {
    if (user?.id) {
      navigator.clipboard.writeText(user.id)
      toast.success('用户ID已复制到剪贴板')
    }
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
                <div>
                  <label className="text-sm text-muted-foreground">用户ID</label>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm">{user?.id || '未知'}</p>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={copyUserId}
                      className="h-6 w-6"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground">管理员状态</label>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      isAdmin ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isAdmin ? '是' : '否'}
                    </span>
                    {isAdmin && (
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/admin/redeem-codes">
                          <KeyRound className="h-4 w-4 mr-2" />
                          兑换码管理
                        </Link>
                      </Button>
                    )}
                  </div>
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