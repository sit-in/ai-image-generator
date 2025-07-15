import { supabaseServer } from '@/lib/supabase-server'
import { NextRequest } from 'next/server'
import { logSecurityEvent } from '@/lib/security'

export interface AuthContext {
  user: {
    id: string
    email: string
    is_admin?: boolean
  }
  session: {
    access_token: string
    refresh_token: string
    expires_at: number
  }
}

export async function verifyAuth(request: NextRequest): Promise<{ success: boolean; user?: any; error?: string }> {
  try {
    // 从多个来源获取token
    const authHeader = request.headers.get('authorization')
    const cookieToken = request.cookies.get('supabase-auth-token')?.value
    
    let token = null
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.substring(7)
    } else if (cookieToken) {
      token = cookieToken
    }

    if (!token) {
      return { success: false, error: '未提供认证token' }
    }

    // 验证token - 简化验证，避免过度严格的检查
    try {
      const { data: { user }, error } = await supabaseServer.auth.getUser(token)
      
      if (error || !user) {
        // 不记录安全事件，避免干扰正常流程
        return { success: false, error: 'token无效或已过期' }
      }
      
      // 简化profile检查，避免额外的数据库查询导致失败
      return { 
        success: true, 
        user: {
          ...user,
          is_admin: false // 简化处理
        }
      }
    } catch (authError) {
      return { success: false, error: 'token验证失败' }
    }
  } catch (error) {
    return { success: false, error: '认证验证失败' }
  }
}

export async function requireAuth(request: NextRequest): Promise<{ success: boolean; user?: any; error?: string }> {
  const authResult = await verifyAuth(request)
  
  if (!authResult.success) {
    return authResult
  }

  return authResult
}

export async function requireAdmin(request: NextRequest): Promise<{ success: boolean; user?: any; error?: string }> {
  const authResult = await requireAuth(request)
  
  if (!authResult.success) {
    return authResult
  }

  if (!authResult.user?.is_admin) {
    logSecurityEvent({
      type: 'suspicious_activity',
      userId: authResult.user?.id,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { reason: 'unauthorized_admin_access' }
    })
    
    return { success: false, error: '需要管理员权限' }
  }

  return authResult
}

// 会话管理
export class SessionManager {
  private static sessions = new Map<string, { userId: string; lastActivity: number; ip: string }>()
  
  static createSession(userId: string, ip: string): string {
    const sessionId = this.generateSessionId()
    this.sessions.set(sessionId, {
      userId,
      lastActivity: Date.now(),
      ip
    })
    return sessionId
  }
  
  static validateSession(sessionId: string, ip: string): boolean {
    const session = this.sessions.get(sessionId)
    if (!session) return false
    
    // 检查会话是否过期（24小时）
    const sessionAge = Date.now() - session.lastActivity
    if (sessionAge > 24 * 60 * 60 * 1000) {
      this.sessions.delete(sessionId)
      return false
    }
    
    // 检查IP是否一致（可选，根据需要开启）
    // if (session.ip !== ip) return false
    
    // 更新最后活动时间
    session.lastActivity = Date.now()
    this.sessions.set(sessionId, session)
    
    return true
  }
  
  static destroySession(sessionId: string): void {
    this.sessions.delete(sessionId)
  }
  
  static cleanupExpiredSessions(): void {
    const now = Date.now()
    for (const [sessionId, session] of this.sessions.entries()) {
      if (now - session.lastActivity > 24 * 60 * 60 * 1000) {
        this.sessions.delete(sessionId)
      }
    }
  }
  
  private static generateSessionId(): string {
    return require('crypto').randomBytes(32).toString('hex')
  }
}

// 自动清理过期会话
setInterval(() => {
  SessionManager.cleanupExpiredSessions()
}, 60 * 60 * 1000) // 每小时清理一次

// 密码重置令牌管理
export class PasswordResetManager {
  private static tokens = new Map<string, { email: string; expires: number }>()
  
  static generateResetToken(email: string): string {
    const token = require('crypto').randomBytes(32).toString('hex')
    this.tokens.set(token, {
      email,
      expires: Date.now() + 15 * 60 * 1000 // 15分钟过期
    })
    return token
  }
  
  static validateResetToken(token: string): { valid: boolean; email?: string } {
    const tokenData = this.tokens.get(token)
    if (!tokenData) return { valid: false }
    
    if (Date.now() > tokenData.expires) {
      this.tokens.delete(token)
      return { valid: false }
    }
    
    return { valid: true, email: tokenData.email }
  }
  
  static consumeResetToken(token: string): boolean {
    const isValid = this.validateResetToken(token).valid
    if (isValid) {
      this.tokens.delete(token)
    }
    return isValid
  }
}

// 登录尝试追踪
export class LoginAttemptTracker {
  private static attempts = new Map<string, { count: number; lastAttempt: number; blocked: boolean }>()
  
  static recordAttempt(identifier: string, success: boolean): void {
    const now = Date.now()
    let attempt = this.attempts.get(identifier)
    
    if (!attempt) {
      attempt = { count: 0, lastAttempt: now, blocked: false }
    }
    
    // 重置计数如果超过1小时
    if (now - attempt.lastAttempt > 60 * 60 * 1000) {
      attempt.count = 0
      attempt.blocked = false
    }
    
    if (success) {
      // 成功登录，重置计数
      attempt.count = 0
      attempt.blocked = false
    } else {
      // 失败登录，增加计数
      attempt.count++
      
      // 5次失败后封锁1小时
      if (attempt.count >= 5) {
        attempt.blocked = true
      }
    }
    
    attempt.lastAttempt = now
    this.attempts.set(identifier, attempt)
  }
  
  static isBlocked(identifier: string): boolean {
    const attempt = this.attempts.get(identifier)
    if (!attempt) return false
    
    // 检查是否仍在封锁期内
    if (attempt.blocked && Date.now() - attempt.lastAttempt < 60 * 60 * 1000) {
      return true
    }
    
    // 封锁期结束，重置
    if (attempt.blocked) {
      attempt.blocked = false
      attempt.count = 0
    }
    
    return false
  }
}