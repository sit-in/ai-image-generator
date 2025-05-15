'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

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
      setTimeout(() => router.push('/'), 1000)
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleLogin} className="space-y-4 max-w-sm mx-auto mt-10">
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
      <Button type="submit" disabled={loading}>
        {loading ? '登录中...' : '登录'}
      </Button>
      {message && <div className="text-sm text-center text-red-500">{message}</div>}
    </form>
  )
} 