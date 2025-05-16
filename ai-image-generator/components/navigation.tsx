'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { NavigationMenu, NavigationMenuList, NavigationMenuItem, NavigationMenuLink } from '@/components/ui/navigation-menu'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { User, LogOut } from 'lucide-react'

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
    <header className="w-full flex items-center justify-between px-6 py-4 border-b">
      {/* 左侧可放 logo 或留空 */}
      <div />
      <div className="flex items-center">
        <NavigationMenu>
          <NavigationMenuList className="justify-end">
            {!loading && (
              <>
                {user ? (
                  <>
                    <NavigationMenuItem>
                      <Link href="/profile" legacyBehavior passHref>
                        <NavigationMenuLink className="px-4 py-2 hover:bg-accent rounded-md flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          {user.email}
                        </NavigationMenuLink>
                      </Link>
                    </NavigationMenuItem>
                    <NavigationMenuItem>
                      <Button
                        variant="ghost"
                        onClick={handleLogout}
                        className="px-4 py-2 hover:bg-accent rounded-md flex items-center"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        退出
                      </Button>
                    </NavigationMenuItem>
                  </>
                ) : (
                  <NavigationMenuItem>
                    <Link href="/login" legacyBehavior passHref>
                      <NavigationMenuLink className="px-4 py-2 hover:bg-accent rounded-md">
                        登录/注册
                      </NavigationMenuLink>
                    </Link>
                  </NavigationMenuItem>
                )}
              </>
            )}
          </NavigationMenuList>
        </NavigationMenu>
      </div>
    </header>
  )
} 