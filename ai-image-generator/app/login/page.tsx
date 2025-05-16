'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error, data } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage(error.message)
    } else {
      // 登录成功，保存 userId 到 localStorage
      localStorage.setItem('userId', data.user?.id || '')
      setMessage('登录成功，正在跳转...')
      setTimeout(() => window.location.replace('/'), 1000)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <form onSubmit={handleLogin} className="space-y-4">
        <h2 className="text-xl font-bold">登录</h2>
        <Input
          type="email"
          placeholder="邮箱"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
        <Input
          type="password"
          placeholder="密码"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <Button type="submit" disabled={loading} className="w-full">
          {loading ? '登录中...' : '登录'}
        </Button>
        {message && <div className="text-sm text-center text-red-500">{message}</div>}
      </form>
      <div className="mt-4 text-center text-sm">
        还没有账号？
        <Link href="/register" className="text-primary hover:underline">
          立即注册
        </Link>
      </div>
      <div className="mt-2 text-center">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground">
          返回首页
        </Link>
      </div>
    </div>
  )
} 