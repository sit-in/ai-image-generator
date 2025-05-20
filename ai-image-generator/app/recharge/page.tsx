'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { ArrowLeft } from 'lucide-react'

export default function RechargePage() {
  const [loading, setLoading] = useState(true)
  const [redeemCode, setRedeemCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const router = useRouter()

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      router.push('/login')
      return
    }
    setLoading(false)
  }

  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      toast.error('请输入兑换码')
      return
    }

    try {
      setRedeeming(true)
      const { data: { session } } = await supabase.auth.getSession()
      
      const response = await fetch('/api/redeem', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.access_token}`
        },
        body: JSON.stringify({
          code: redeemCode.trim(),
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.message || '兑换失败')
      }

      toast.success(`兑换成功，获得 ${data.amount} 积分`)
      setRedeemCode('')
    } catch (error) {
      console.error('兑换失败:', error)
      toast.error(error instanceof Error ? error.message : '兑换失败')
    } finally {
      setRedeeming(false)
    }
  }

  if (loading) {
    return <div className="container mx-auto px-4 py-8">加载中...</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            返回首页
          </Button>
          <h1 className="text-2xl font-bold">积分充值</h1>
        </div>

        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>兑换码充值</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="redeemCode">兑换码</Label>
                  <div className="flex gap-2">
                    <Input
                      id="redeemCode"
                      value={redeemCode}
                      onChange={e => setRedeemCode(e.target.value)}
                      placeholder="请输入兑换码"
                      className="flex-1"
                    />
                    <Button
                      onClick={handleRedeem}
                      disabled={redeeming}
                    >
                      {redeeming ? '兑换中...' : '兑换'}
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>充值说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="prose prose-sm">
                  <p>您可以通过以下方式获取积分：</p>
                  <ul>
                    <li>使用兑换码充值</li>
                    <li>联系客服购买积分</li>
                  </ul>
                  <p>积分使用规则：</p>
                  <ul>
                    <li>生成图片消耗 10 积分/张</li>
                    <li>积分永久有效</li>
                    <li>不支持退款</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 