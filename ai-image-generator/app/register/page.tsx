'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error, data } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage(error.message)
    } else {
      // 注册成功，保存 userId 到 localStorage
      localStorage.setItem('userId', data.user?.id || '')
      setMessage('注册成功，正在跳转...')
      setTimeout(() => window.location.replace('/'), 1000)
    }
    setLoading(false)
  }

  return (
    <div className="max-w-sm mx-auto mt-10">
      <form onSubmit={handleRegister} className="space-y-4">
        <h2 className="text-xl font-bold">注册</h2>
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
          {loading ? '注册中...' : '注册'}
        </Button>
        {message && <div className="text-sm text-center text-red-500">{message}</div>}
      </form>
      <div className="mt-4 text-center text-sm">
        已有账号？
        <Link href="/login" className="text-primary hover:underline">
          立即登录
        </Link>
      </div>
    </div>
  )
} 