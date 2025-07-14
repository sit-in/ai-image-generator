import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // 获取token从cookie或header
  const token = request.cookies.get('supabase-auth-token')?.value || 
                request.headers.get('authorization')?.replace('Bearer ', '')
  
  const { pathname } = request.nextUrl

  // 需要认证的路由
  const protectedRoutes = [
    '/generations',
    '/profile',
    '/recharge',
    '/admin',
    '/redeem'
  ]

  // 只有管理员可以访问的路由
  const adminRoutes = [
    '/admin'
  ]

  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  )

  // 检查是否是管理员路由
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  )

  // 如果是受保护的路由但没有token，重定向到登录页面
  if (isProtectedRoute && !token) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // 对于API路由，添加安全头
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next()
    
    // 添加安全头
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    // 添加CORS头
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
    
    return response
  }

  // 管理员路由需要额外验证（这里简化处理，实际应该验证JWT中的admin字段）
  if (isAdminRoute && token) {
    // 这里应该解析JWT验证admin权限，为了简化暂时跳过
    // 在实际应用中，您需要验证JWT中的admin字段
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
}