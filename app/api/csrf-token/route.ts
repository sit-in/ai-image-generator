import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { CSRFProtection } from '@/lib/security'

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

// 验证CSRF token的辅助函数
export function validateCSRFToken(request: NextRequest): { valid: boolean; error?: string } {
  try {
    const token = request.headers.get('x-csrf-token') || 
                 request.headers.get('X-CSRF-Token')
    
    if (!token) {
      return { valid: false, error: '缺少CSRF token' }
    }
    
    const sessionId = request.cookies.get('session-id')?.value || 
                     request.headers.get('x-session-id') || 
                     'anonymous'
    
    const isValid = CSRFProtection.validateToken(token, sessionId)
    
    return { 
      valid: isValid, 
      error: isValid ? undefined : 'CSRF token无效或已过期' 
    }
  } catch (error) {
    return { valid: false, error: 'CSRF token验证失败' }
  }
}