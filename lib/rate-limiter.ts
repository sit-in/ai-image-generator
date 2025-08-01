import { NextRequest } from 'next/server'

interface RateLimitConfig {
  windowMs: number // 时间窗口（毫秒）
  maxRequests: number // 最大请求数
  message?: string // 超限时的错误消息
}

interface RateLimitEntry {
  count: number
  resetTime: number
}

// 内存存储（生产环境建议使用Redis）
const store = new Map<string, RateLimitEntry>()

// 警告提示
if (process.env.NODE_ENV === 'production' && !process.env.REDIS_URL) {
  console.warn('WARNING: Using in-memory rate limiting in production. This is not recommended for multi-instance deployments. Set REDIS_URL to enable Redis-based rate limiting.')
}

export class RateLimiter {
  private config: RateLimitConfig

  constructor(config: RateLimitConfig) {
    this.config = config
  }

  // 获取客户端标识符
  private getClientId(request: NextRequest): string {
    // 优先使用用户ID，其次使用IP
    const userId = request.cookies.get('user-id')?.value
    if (userId) return `user:${userId}`
    
    const forwarded = request.headers.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown'
    return `ip:${ip}`
  }

  // 检查是否超过限制
  check(request: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    const clientId = this.getClientId(request)
    const now = Date.now()
    
    // 清理过期的记录
    this.cleanup(now)
    
    let entry = store.get(clientId)
    
    if (!entry) {
      // 首次请求
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs
      }
      store.set(clientId, entry)
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: entry.resetTime
      }
    }
    
    if (now >= entry.resetTime) {
      // 重置窗口
      entry.count = 1
      entry.resetTime = now + this.config.windowMs
      store.set(clientId, entry)
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: entry.resetTime
      }
    }
    
    // 在窗口内
    entry.count++
    store.set(clientId, entry)
    
    return {
      allowed: entry.count <= this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime
    }
  }

  // 清理过期记录
  private cleanup(now: number) {
    for (const [key, entry] of store.entries()) {
      if (now >= entry.resetTime) {
        store.delete(key)
      }
    }
  }

  // 重置指定标识符的速率限制
  reset(identifier: string): void {
    // 删除所有包含该标识符的键
    for (const key of store.keys()) {
      if (key.includes(identifier)) {
        store.delete(key);
      }
    }
  }
}

// 从工厂导入预定义的限制器实例
export { rateLimiters } from './rate-limiter-factory'

// 创建速率限制响应
export function createRateLimitResponse(message: string, resetTime: number) {
  return new Response(
    JSON.stringify({
      error: message,
      resetTime: new Date(resetTime).toISOString()
    }),
    {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
      }
    }
  )
}