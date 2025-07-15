'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, LogOut, History, Layers } from 'lucide-react'

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !session?.user) {
          setUser(null);
          setLoading(false);
          return;
        }
        setUser(session.user);
        setLoading(false);
      } catch (error) {
        console.error('获取用户状态失败:', error);
        setUser(null);
        setLoading(false);
      }
    };
    fetchUser();

    // 监听认证状态变化
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
      } else if (session?.user) {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('userId')
    setUser(null)
    router.push('/login')
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-700/50">
      <div className="container mx-auto px-4 h-18 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-3 group">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-lg">AI</span>
            </div>
            <div className="absolute -inset-1 bg-gradient-to-br from-purple-600 to-blue-600 rounded-xl opacity-20 blur group-hover:opacity-40 transition-opacity duration-300"></div>
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI 图片生成器
            </h1>
            <p className="text-xs text-muted-foreground -mt-1">
              创造无限可能
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link href="/generations">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors duration-200"
                >
                  <History className="h-4 w-4" />
                  <span className="hidden sm:inline">生成历史</span>
                </Button>
              </Link>
              <Link href="/batch">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors duration-200"
                >
                  <Layers className="h-4 w-4" />
                  <span className="hidden sm:inline">批量管理</span>
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={handleLogout} 
                className="flex items-center gap-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-200"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">退出</span>
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button 
                variant="default" 
                className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">登录</span>
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
} 