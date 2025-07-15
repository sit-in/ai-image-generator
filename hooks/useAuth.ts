'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // 获取初始用户状态
    const getInitialUser = async () => {
      try {
        // 先尝试从 session 获取
        const { data: { session } } = await supabase.auth.getSession()
        console.log('useAuth - 获取到的 session:', session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          setLoading(false)
          return
        }
        
        // 如果没有 session，再尝试获取 user
        const { data: { user } } = await supabase.auth.getUser()
        console.log('useAuth - 获取到的 user:', user?.email)
        setUser(user)
      } catch (error) {
        console.error('获取用户信息失败:', error)
      } finally {
        setLoading(false)
      }
    }

    getInitialUser()

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('认证状态变化:', event, session?.user?.email)
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null)
        } else if (event === 'SIGNED_OUT') {
          setUser(null)
        }
        
        setLoading(false)
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return { user, loading }
}