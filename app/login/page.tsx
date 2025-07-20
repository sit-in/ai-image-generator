'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Mail, Lock, Sparkles, Zap, Users, Palette } from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { migrateGuestDataToUser, getGuestImages } from '@/lib/guest-trial'
import { CuteTabs } from '@/components/CuteTabs'
import { MagicLinkLogin } from '@/components/ui/magic-link-login'

function LoginPageContent() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  
  const loginTabs = [
    { id: 'password', label: '密码登录', icon: '🔐' },
    { id: 'magiclink', label: '邮箱验证', icon: '✉️' }
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      const { error, data } = await supabase.auth.signInWithPassword({ email, password })
      
      if (error) {
        toast.error('登录失败', {
          description: error.message
        })
        setLoading(false)
        return
      }
      
      if (data.user) {
        // 登录成功，保存 userId 到 localStorage
        localStorage.setItem('userId', data.user.id)
        
        // 检查并迁移游客数据
        const guestImages = getGuestImages()
        if (guestImages.length > 0) {
          console.log('检测到游客数据，开始迁移...')
          await migrateGuestDataToUser(data.user.id)
          toast.success('登录成功', {
            description: '已自动恢复您的试用作品'
          })
        } else {
          toast.success('登录成功', {
            description: '正在跳转...'
          })
        }
        
        // 确保会话已经建立
        const { data: { session } } = await supabase.auth.getSession()
        console.log('登录成功，会话状态:', session?.user?.email)
        
        // 使用 window.location 确保页面完全刷新，避免认证状态不同步
        setTimeout(() => {
          window.location.href = redirect
        }, 1000)
      }
    } catch (err) {
      console.error('登录错误:', err)
      toast.error('登录失败', {
        description: '请稍后重试'
      })
      setLoading(false)
    }
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
          {/* Left Side - Branding */}
          <div className="lg:w-1/2 text-center lg:text-left">
            <div className="relative inline-block mb-6">
              <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent">
                AI 图片生成器
              </h1>
              <div className="absolute -top-2 -right-2">
                <Sparkles className="h-8 w-8 text-yellow-500 animate-pulse" />
              </div>
            </div>
            
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              将你的创意转化为精美的AI艺术作品，
              <br />
              支持多种风格，让想象力尽情绽放。
            </p>
            
            {/* Feature Cards */}
            <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-sm font-medium">多样风格</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Palette className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                </div>
                <span className="text-sm font-medium">精美画质</span>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                  <Users className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                </div>
                <span className="text-sm font-medium">数万用户的选择</span>
              </div>
            </div>
          </div>

          {/* Right Side - Login Form */}
          <div className="lg:w-1/2 w-full max-w-md">
            <Card className="shadow-2xl border-0 bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl">
              <CardHeader className="space-y-4 pb-8">
                <div className="text-center">
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                    欢迎回来
                  </CardTitle>
                  <p className="text-muted-foreground mt-2">
                    登录您的账户开始创作
                  </p>
                </div>
                
                {/* Stats */}
                <div className="flex justify-center space-x-4">
                  <Badge variant="secondary" className="px-3 py-1">
                    <Sparkles className="h-3 w-3 mr-1" />
                    新用户50积分
                  </Badge>
                  <Badge variant="secondary" className="px-3 py-1">
                    <Zap className="h-3 w-3 mr-1" />
                    即时生成
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-6">
                <CuteTabs tabs={loginTabs} defaultTab="password">
                  {{
                    'password': (
                      <form onSubmit={handleLogin} className="space-y-6">
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
                              placeholder="请输入密码"
                              value={password}
                              onChange={e => setPassword(e.target.value)}
                              className="pl-10 h-12 border-2 focus:border-purple-500 rounded-xl transition-all duration-200"
                              required
                            />
                          </div>
                        </div>

                        <Button 
                          type="submit" 
                          disabled={loading}
                          className="w-full h-12 text-lg font-semibold rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
                        >
                          {loading ? (
                            <div className="flex items-center">
                              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                              登录中...
                            </div>
                          ) : (
                            '立即登录'
                          )}
                        </Button>
                      </form>
                    ),
                    'magiclink': (
                      <MagicLinkLogin redirectTo={redirect} />
                    )
                  }}
                </CuteTabs>

                <div className="space-y-4">
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">还没有账户？</span>
                    </div>
                  </div>

                  <Link href="/register">
                    <Button 
                      variant="outline" 
                      className="w-full h-12 rounded-xl border-2 border-purple-200 dark:border-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
                    >
                      创建新账户
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

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-blue-900/20 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  )
} 