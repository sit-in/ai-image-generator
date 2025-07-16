import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 获取多种可能的token来源
  const authHeader = request.headers.get('authorization')
  const bearerToken = authHeader?.replace('Bearer ', '')
  
  // 检查Supabase v2 session cookies
  // Supabase v2 使用带有项目引用的cookie名称
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const projectRef = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/)?.[1] || ''
  
  // Supabase v2 cookie格式: sb-<project-ref>-auth-token
  const authTokenCookie = request.cookies.get(`sb-${projectRef}-auth-token`)?.value
  const authTokenParts = request.cookies.get(`sb-${projectRef}-auth-token.0`)?.value
  const authTokenParts1 = request.cookies.get(`sb-${projectRef}-auth-token.1`)?.value
  
  // 如果有任何形式的认证信息，认为用户已登录
  const hasAuth = !!(bearerToken || authTokenCookie || authTokenParts || authTokenParts1)
  
  // Debug logging
  if (pathname === '/recharge') {
    console.log('Middleware - Recharge page auth check:', {
      pathname,
      projectRef,
      hasAuth,
      bearerToken: !!bearerToken,
      authTokenCookie: !!authTokenCookie,
      authTokenParts: !!authTokenParts,
      authTokenParts1: !!authTokenParts1,
      cookies: request.cookies.getAll().map(c => c.name)
    })
  }

  // 需要认证的路由（移除/generations和/recharge，让客户端处理）
  const protectedRoutes = [
    '/profile',
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

  // 如果是受保护的路由但没有任何认证信息，重定向到登录页面
  if (isProtectedRoute && !hasAuth) {
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
  if (isAdminRoute && hasAuth) {
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