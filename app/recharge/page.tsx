'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { supabase } from '@/lib/supabase'
import { ArrowLeft, Gift, CreditCard, Key, Sparkles, ShoppingCart, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react'
import RechargePackages from '@/components/recharge-packages'

export default function RechargePage() {
  const [redeemCode, setRedeemCode] = useState('')
  const [redeeming, setRedeeming] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(false)
  const router = useRouter()

  const checkAuthStatus = async () => {
    setCheckingAuth(true)
    try {
      const { data: { session } } = await supabase.auth.getSession()
      const { data: { user } } = await supabase.auth.getUser()
      
      console.log('充值页面 - 检查认证:', { 
        hasSession: !!session,
        hasUser: !!user,
        userEmail: user?.email 
      })
      
      if (!session && !user) {
        router.push('/login?redirect=/recharge')
        return false
      }
      return true
    } catch (error) {
      console.error('检查认证失败:', error)
      return false
    } finally {
      setCheckingAuth(false)
    }
  }

  const handleRedeem = async () => {
    if (!redeemCode.trim()) {
      toast.error('请输入兑换码')
      return
    }

    // 先检查认证状态
    const isAuthenticated = await checkAuthStatus()
    if (!isAuthenticated) {
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

  // 不再在页面加载时检查认证，只在用户操作时检查

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/')}
            className="flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200 group mb-6"
          >
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-200" />
            返回首页
          </Button>
          
          <div className="text-center">
            <h1 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
              积分充值中心
            </h1>
            <p className="text-xl text-muted-foreground">
              选择最适合您的充值方式，开启无限创作之旅
            </p>
          </div>
        </div>

        {/* Tabs for different recharge methods */}
        <Tabs defaultValue="packages" className="w-full max-w-6xl mx-auto">
          <TabsList className="grid w-full grid-cols-2 mb-8 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
            <TabsTrigger 
              value="packages" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-200"
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              充值套餐
            </TabsTrigger>
            <TabsTrigger 
              value="redeem"
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white transition-all duration-200"
            >
              <Key className="h-4 w-4 mr-2" />
              兑换码充值
            </TabsTrigger>
          </TabsList>

          <TabsContent value="packages" className="space-y-8">
            <RechargePackages />
          </TabsContent>

          <TabsContent value="redeem" className="space-y-8">
            <div className="max-w-2xl mx-auto">
              {/* Redeem Code Section */}
              <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl border-0 shadow-2xl">
                <CardHeader className="text-center pb-8">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-600 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Key className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    兑换码充值
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    输入兑换码即可获得积分
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Input
                        value={redeemCode}
                        onChange={e => setRedeemCode(e.target.value)}
                        placeholder="请输入兑换码"
                        className="h-12 pl-4 pr-4 border-2 focus:border-purple-500 rounded-xl transition-all duration-200"
                        disabled={redeeming}
                      />
                      {redeemCode && (
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        </div>
                      )}
                    </div>
                    
                    <Button
                      onClick={handleRedeem}
                      disabled={redeeming || !redeemCode.trim()}
                      className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                    >
                      {redeeming ? (
                        <div className="flex items-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          兑换中...
                        </div>
                      ) : (
                        <>
                          <Gift className="h-5 w-5 mr-2" />
                          立即兑换
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Redeem Code Types */}
                  <div className="space-y-3">
                    <h3 className="font-semibold text-sm text-muted-foreground">兑换码类型</h3>
                    <div className="grid gap-3">
                      <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div>
                          <div className="font-medium text-green-800 dark:text-green-400">基础码 (BASIC)</div>
                          <div className="text-xs text-green-600 dark:text-green-500">100积分，可生成10张图片</div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-400">
                          100积分
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div>
                          <div className="font-medium text-blue-800 dark:text-blue-400">标准码 (STANDARD)</div>
                          <div className="text-xs text-blue-600 dark:text-blue-500">300积分，可生成30张图片</div>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-400">
                          300积分
                        </Badge>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                        <div>
                          <div className="font-medium text-purple-800 dark:text-purple-400">高级码 (PREMIUM)</div>
                          <div className="text-xs text-purple-600 dark:text-purple-500">1000积分，可生成100张图片</div>
                        </div>
                        <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-400">
                          1000积分
                        </Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Instructions */}
              <Card className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-800">
                <CardHeader>
                  <CardTitle className="flex items-center text-amber-800 dark:text-amber-200">
                    <AlertCircle className="h-5 w-5 mr-2" />
                    兑换说明
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 text-sm text-amber-700 dark:text-amber-300">
                    <div className="flex items-start space-x-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>每个兑换码只能使用一次</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>兑换的积分立即到账</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>积分永久有效，无过期时间</span>
                    </div>
                    <div className="flex items-start space-x-2">
                      <span className="text-amber-500 mt-0.5">•</span>
                      <span>如有问题请联系客服</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
} 