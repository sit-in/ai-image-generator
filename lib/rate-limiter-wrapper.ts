import { NextRequest } from 'next/server'

// 简单的内存存储速率限制器
const requestCounts = new Map();

export function checkRateLimit(request: Request, config: { windowMs: number, maxRequests: number }) {
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  const key = `${ip}:${config.windowMs}`;
  const now = Date.now();
  
  // 获取或创建记录
  let record = requestCounts.get(key) || { count: 0, resetTime: now + config.windowMs };
  
  // 如果超过时间窗口，重置
  if (now > record.resetTime) {
    record = { count: 0, resetTime: now + config.windowMs };
  }
  
  // 增加计数
  record.count++;
  requestCounts.set(key, record);
  
  // 检查是否超限
  const allowed = record.count <= config.maxRequests;
  const remaining = Math.max(0, config.maxRequests - record.count);
  
  return {
    allowed,
    remaining,
    resetTime: record.resetTime
  };
}

// 清理过期记录
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now > record.resetTime) {
      requestCounts.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

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
        'X-RateLimit-Limit': '5',
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(resetTime).toISOString(),
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
      }
    }
  )
}
