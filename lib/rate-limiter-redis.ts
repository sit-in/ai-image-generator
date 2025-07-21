import { NextRequest } from 'next/server';
import Redis from 'ioredis';

interface RateLimitConfig {
  windowMs: number; // 时间窗口（毫秒）
  maxRequests: number; // 最大请求数
  message?: string; // 超限时的错误消息
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetTime: number;
}

// Redis 客户端（如果配置了 REDIS_URL）
let redis: Redis | null = null;
if (process.env.REDIS_URL) {
  try {
    redis = new Redis(process.env.REDIS_URL);
    console.log('Redis rate limiter initialized');
  } catch (error) {
    console.error('Failed to initialize Redis:', error);
  }
}

// 内存存储作为后备方案
const memoryStore = new Map<string, { count: number; resetTime: number }>();

export class EnhancedRateLimiter {
  private config: RateLimitConfig;
  private prefix: string;

  constructor(config: RateLimitConfig, prefix: string = 'rate_limit') {
    this.config = config;
    this.prefix = prefix;
  }

  // 获取客户端标识符
  private getClientId(request: NextRequest): string {
    // 优先使用用户ID，其次使用IP
    const userId = request.cookies.get('user-id')?.value;
    if (userId) return `user:${userId}`;
    
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0] : request.ip || 'unknown';
    return `ip:${ip}`;
  }

  // 检查是否超过限制
  async check(request: NextRequest): Promise<RateLimitResult> {
    const clientId = this.getClientId(request);
    const key = `${this.prefix}:${clientId}`;
    
    // 如果有 Redis，使用 Redis
    if (redis) {
      try {
        return await this.checkWithRedis(key);
      } catch (error) {
        console.error('Redis rate limit check failed, falling back to memory:', error);
        // 降级到内存存储
      }
    }
    
    // 使用内存存储
    return this.checkWithMemory(key);
  }

  // Redis 实现
  private async checkWithRedis(key: string): Promise<RateLimitResult> {
    if (!redis) throw new Error('Redis not initialized');
    
    const now = Date.now();
    const windowStart = now - this.config.windowMs;
    
    // 使用 Redis 的滑动窗口算法
    const pipe = redis.pipeline();
    
    // 移除过期的记录
    pipe.zremrangebyscore(key, '-inf', windowStart);
    
    // 添加当前请求
    pipe.zadd(key, now, `${now}-${Math.random()}`);
    
    // 设置过期时间
    pipe.expire(key, Math.ceil(this.config.windowMs / 1000));
    
    // 计算当前窗口内的请求数
    pipe.zcount(key, windowStart, '+inf');
    
    const results = await pipe.exec();
    if (!results) throw new Error('Redis pipeline failed');
    
    const count = results[3]?.[1] as number || 0;
    const allowed = count <= this.config.maxRequests;
    
    // 如果超过限制，移除刚添加的记录
    if (!allowed) {
      await redis.zremrangebyrank(key, -1, -1);
    }
    
    return {
      allowed,
      remaining: Math.max(0, this.config.maxRequests - count + (allowed ? 0 : 1)),
      resetTime: now + this.config.windowMs
    };
  }

  // 内存存储实现（与原版相同）
  private checkWithMemory(key: string): RateLimitResult {
    const now = Date.now();
    
    // 清理过期的记录
    this.cleanupMemoryStore(now);
    
    let entry = memoryStore.get(key);
    
    if (!entry) {
      // 首次请求
      entry = {
        count: 1,
        resetTime: now + this.config.windowMs
      };
      memoryStore.set(key, entry);
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: entry.resetTime
      };
    }
    
    if (now >= entry.resetTime) {
      // 重置窗口
      entry.count = 1;
      entry.resetTime = now + this.config.windowMs;
      memoryStore.set(key, entry);
      
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: entry.resetTime
      };
    }
    
    // 在窗口内
    entry.count++;
    memoryStore.set(key, entry);
    
    return {
      allowed: entry.count <= this.config.maxRequests,
      remaining: Math.max(0, this.config.maxRequests - entry.count),
      resetTime: entry.resetTime
    };
  }

  // 清理内存存储中的过期记录
  private cleanupMemoryStore(now: number) {
    for (const [key, entry] of memoryStore.entries()) {
      if (now >= entry.resetTime) {
        memoryStore.delete(key);
      }
    }
  }
}

// 预定义的限制器（使用增强版）
export const enhancedRateLimiters = {
  // 图片生成限制：每分钟3次
  imageGeneration: new EnhancedRateLimiter({
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 3,
    message: '图片生成请求过于频繁，请稍后再试'
  }, 'rate_limit:image_generation'),
  
  // API通用限制：每分钟100次
  api: new EnhancedRateLimiter({
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 100,
    message: 'API请求过于频繁，请稍后再试'
  }, 'rate_limit:api'),
  
  // 登录限制：每5分钟10次
  auth: new EnhancedRateLimiter({
    windowMs: 5 * 60 * 1000, // 5分钟
    maxRequests: 10,
    message: '登录尝试过于频繁，请稍后再试'
  }, 'rate_limit:auth'),
  
  // 兑换码限制：每小时5次
  redeem: new EnhancedRateLimiter({
    windowMs: 60 * 60 * 1000, // 1小时
    maxRequests: 5,
    message: '兑换码使用过于频繁，请稍后再试'
  }, 'rate_limit:redeem')
};

// 导出原有的接口以保持兼容性
export { createRateLimitResponse } from './rate-limiter';