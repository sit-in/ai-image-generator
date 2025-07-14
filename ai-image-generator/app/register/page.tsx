'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mail, Lock, Sparkles, Zap, Gift, Star, CheckCircle } from 'lucide-react'
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
    
    const { error, data } = await supabase.auth.signUp({ email, password })
    if (error) {
      toast.error('注册失败', {
        description: error.message
      })
    } else {
      // 注册成功，保存 userId 到 localStorage
      localStorage.setItem('userId', data.user?.id || '')
      toast.success('注册成功', {
        description: '欢迎加入AI创作社区！正在跳转...'
      })
      setTimeout(() => window.location.replace('/'), 1000)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20">
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
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                开始创作
              </h1>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              立即注册，享受专业AI图片生成服务
            </p>

            {/* Benefits */}
            <div className="space-y-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Gift className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-1">免费30积分</h3>
                  <p className="text-muted-foreground">新用户注册即获得30积分，可生成3张高质量图片</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-1">即时生成</h3>
                  <p className="text-muted-foreground">先进的AI技术，秒级响应，快速生成专业级图片</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Star className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold mb-1">多样风格</h3>
                  <p className="text-muted-foreground">6种精美风格：自然、动漫、油画、水彩、像素、吉卜力</p>
                </div>
              </div>
            </div>

            {/* Social Proof */}
            <div className="mt-8 p-6 bg-white/50 dark:bg-gray-800/50 rounded-2xl backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50">
              <div className="flex items-center justify-center space-x-6 text-center">
                <div>
                  <div className="text-2xl font-bold text-purple-600">10,000+</div>
                  <div className="text-sm text-muted-foreground">注册用户</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">50,000+</div>
                  <div className="text-sm text-muted-foreground">生成图片</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-indigo-600">4.9</div>
                  <div className="text-sm text-muted-foreground">用户评分</div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side - Register Form */}
          <div className="lg:w-1/2 w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardHeader className="space-y-4 pb-8">
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    创建账户
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    几秒钟即可开始您的AI创作
                  </p>
                </div>
                
                {/* Registration Benefits */}
                <div className="space-y-2">
                  <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">永久免费账户</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-blue-600 dark:text-blue-400">
                    <CheckCircle className="h-4 w-4" />
                    <span className="text-sm">30积分新人礼包</span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
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
                        placeholder="请设置密码（至少6位）"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        className="pl-10 h-12 border-2 focus:border-purple-500 rounded-xl transition-all duration-200"
                        required
                        minLength={6}
                      />
                    </div>
                  </div>

                  <div className="text-xs text-muted-foreground text-center">
                    注册即表示您同意我们的服务条款和隐私政策
                  </div>

                  <Button 
                    type="submit" 
                    disabled={loading}
                    className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        创建账户中...
                      </div>
                    ) : (
                      <>
                        <Gift className="h-5 w-5 mr-2" />
                        免费创建账户
                      </>
                    )}
                  </Button>
                </form>

                <div className="space-y-4">
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
                      立即登录
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
} 