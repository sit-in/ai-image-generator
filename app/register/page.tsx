'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mail, Lock, Sparkles, Gift, Crown } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error, data } = await supabase.auth.signUp({ 
        email, 
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`
        }
      })
      
      if (error) {
        toast.error('注册失败', {
          description: error.message
        })
        setLoading(false)
        return
      }
      
      if (data.user) {
        // 注册成功
        toast.success('注册成功！', {
          description: '请查看您的邮箱验证账户'
        })
        
        // 3秒后跳转到登录页
        setTimeout(() => {
          router.push('/login')
        }, 3000)
      }
    } catch (err) {
      console.error('注册错误:', err)
      toast.error('注册失败', {
        description: '请稍后重试'
      })
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-rose-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center text-muted-foreground hover:text-foreground transition-colors duration-200 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            返回首页
          </Link>
        </div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-12 max-w-6xl mx-auto">
          {/* Left Side - Benefits */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="relative inline-block mb-6">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent">
                立即加入
              </h1>
              <div className="absolute -top-2 -right-2">
                <Crown className="h-8 w-8 text-yellow-500 animate-bounce" />
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              解锁AI创作的无限可能，
              <br />
              开启您的艺术创作之旅。
            </p>
            
            {/* Benefits */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center flex-shrink-0">
                  <Gift className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">新用户礼包</h3>
                  <p className="text-muted-foreground">注册即送50积分，立即开始创作</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">多样化风格</h3>
                  <p className="text-muted-foreground">支持动漫、油画、水彩等多种艺术风格</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center flex-shrink-0">
                  <Crown className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="text-left">
                  <h3 className="font-semibold text-lg">专属权益</h3>
                  <p className="text-muted-foreground">享受会员专属功能和优惠活动</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="lg:w-1/2 w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardHeader className="space-y-4 pb-8">
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-rose-600 bg-clip-text text-transparent">
                    创建新账户
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    加入我们，开始AI创作之旅
                  </p>
                </div>
                
                {/* New User Benefits */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-4 border border-green-200 dark:border-green-700">
                  <div className="flex items-center justify-center space-x-2">
                    <Gift className="h-5 w-5 text-green-600 dark:text-green-400" />
                    <span className="font-semibold text-green-700 dark:text-green-300">新用户专享</span>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400 mt-1 text-center">
                    注册即送50积分，可生成5张精美图片
                  </p>
                </div>
              </CardHeader>

              <CardContent>
                <form onSubmit={handleRegister} className="space-y-6">
                  <div className="space-y-4">
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="email"
                        placeholder="请输入邮箱地址"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="pl-10 h-12 border-2 focus:border-purple-500 rounded-xl transition-all duration-200"
                        required
                      />
                    </div>
                    
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        type="password"
                        placeholder="设置密码（至少6位）"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pl-10 h-12 border-2 focus:border-purple-500 rounded-xl transition-all duration-200"
                        minLength={6}
                        required
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-700 hover:to-rose-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        注册中...
                      </div>
                    ) : (
                      '立即注册'
                    )}
                  </Button>
                </form>

                <div className="mt-6 space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">已有账户？</span>
                    </div>
                  </div>

                  <Link href="/login">
                    <Button 
                      variant="outline" 
                      className="w-full h-12 rounded-xl border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                    >
                      返回登录
                    </Button>
                  </Link>
                </div>

                <p className="text-xs text-center text-muted-foreground mt-6">
                  注册即表示您同意我们的
                  <Link href="/terms" className="text-purple-600 hover:underline mx-1">
                    服务条款
                  </Link>
                  和
                  <Link href="/privacy" className="text-purple-600 hover:underline mx-1">
                    隐私政策
                  </Link>
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 