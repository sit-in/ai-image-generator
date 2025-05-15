'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

export default function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    const { error } = await supabase.auth.signUp({ email, password })
    if (error) {
      setMessage(error.message)
    } else {
      setMessage('注册成功，请查收邮箱激活账号！')
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleRegister} className="space-y-4 max-w-sm mx-auto mt-10">
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
      <Button type="submit" disabled={loading}>
        {loading ? '注册中...' : '注册'}
      </Button>
      {message && <div className="text-sm text-center text-red-500">{message}</div>}
    </form>
  )
} 