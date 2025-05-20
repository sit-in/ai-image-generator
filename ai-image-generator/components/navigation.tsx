'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, LogOut, History } from 'lucide-react'

export default function Navigation() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setUser(null);
        setLoading(false);
        return;
      }
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, [pathname]);

  const handleLogout = async () => {
    await supabase.auth.signOut()
    localStorage.removeItem('userId')
    setUser(null)
    router.push('/login')
  }

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold">
          AI 图片生成器
        </Link>

        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/generations">
                <Button variant="ghost" className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  生成历史
                </Button>
              </Link>
              <Button variant="ghost" onClick={handleLogout} className="flex items-center gap-2">
                <LogOut className="h-4 w-4" />
                退出
              </Button>
            </>
          ) : (
            <Link href="/login">
              <Button variant="ghost" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                登录
              </Button>
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
} 