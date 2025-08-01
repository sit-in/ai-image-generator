import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { CSRFProtection } from '@/lib/csrf'

// 标记为动态路由，因为使用了 cookies
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 从session或cookie中获取session ID
    const sessionId = request.cookies.get('session-id')?.value || 
                     request.headers.get('x-session-id') || 
                     'anonymous'
    
    const token = CSRFProtection.generateToken(sessionId)
    
    const response = NextResponse.json({
      success: true,
      token
    })
    
    // 设置安全头
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
    
    return response
  } catch (error) {
    console.error('生成CSRF token失败:', error)
    
    return NextResponse.json(
      { success: false, error: 'CSRF token生成失败' },
      { status: 500 }
    )
  }
}