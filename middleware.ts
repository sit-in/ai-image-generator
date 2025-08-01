import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { extractTokenEdge, parseJWT, isTokenExpired } from './lib/auth-edge'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // i18n处理暂时禁用，等待修复

  // 使用 Edge 兼容版本提取 token
  const token = extractTokenEdge(request)
  const hasAuth = !!token
  
  // 解析 token（不验证签名，仅用于中间件路由保护）
  let userId: string | null = null
  let tokenValid = false
  
  if (token) {
    const decoded = parseJWT(token)
    if (decoded?.sub && !isTokenExpired(decoded.exp)) {
      userId = decoded.sub
      tokenValid = true
    }
  }
  
  // Debug logging
  if (pathname === '/recharge' || pathname.startsWith('/admin')) {
    console.log('Middleware - Auth check:', {
      pathname,
      hasAuth,
      tokenValid,
      userId
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

  // 管理员路由在中间件层面只检查是否登录
  // 具体的管理员权限验证在 API 路由中进行
  if (isAdminRoute && !hasAuth) {
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
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