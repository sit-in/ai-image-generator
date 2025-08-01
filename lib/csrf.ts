import crypto from 'crypto'

// CSRF 保护
export class CSRFProtection {
  private static secret = process.env.CSRF_SECRET || 'default-csrf-secret-change-in-production'
  
  // 生成 CSRF token
  static generateToken(sessionId: string): string {
    const timestamp = Date.now()
    const data = `${sessionId}:${timestamp}`
    const hash = crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('hex')
    
    return `${timestamp}:${hash}`
  }
  
  // 验证 CSRF token
  static validateToken(token: string, sessionId: string): boolean {
    if (!token) return false
    
    const [timestamp, hash] = token.split(':')
    if (!timestamp || !hash) return false
    
    // 检查时间戳（24小时有效期）
    const tokenTime = parseInt(timestamp)
    const now = Date.now()
    if (now - tokenTime > 24 * 60 * 60 * 1000) return false
    
    // 验证 hash
    const expectedHash = crypto
      .createHmac('sha256', this.secret)
      .update(`${sessionId}:${timestamp}`)
      .digest('hex')
    
    return crypto.timingSafeEqual(
      Buffer.from(hash),
      Buffer.from(expectedHash)
    )
  }
}