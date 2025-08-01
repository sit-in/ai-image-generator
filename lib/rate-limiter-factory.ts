import { RateLimiter as MemoryRateLimiter } from './rate-limiter';
import { EnhancedRateLimiter } from './rate-limiter-redis';
import Redis from 'ioredis';

export interface RateLimiterInterface {
  check(identifier: any): { allowed: boolean; remaining: number; resetTime: number };
  reset(identifier: string): void;
}

/**
 * 创建速率限制器的工厂函数
 * 根据环境自动选择内存或 Redis 实现
 */
export function createRateLimiter(config: {
  windowMs?: number;
  maxRequests?: number;
  keyPrefix?: string;
  message?: string;
}): RateLimiterInterface {
  // 暂时只使用内存实现，避免类型冲突
  // TODO: 在未来版本中实现统一的异步接口
  
  if (process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    console.warn('[RateLimiter] ⚠️  Redis is configured but not used due to interface compatibility. Using memory rate limiter.');
  }
  
  if (!process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
    console.warn('[RateLimiter] ⚠️  Redis not configured in production! Using memory rate limiter (not suitable for multi-instance deployment)');
  }
  
  return new MemoryRateLimiter({
    windowMs: config.windowMs || 60000,
    maxRequests: config.maxRequests || 100,
    message: config.message
  }) as any;
}

/**
 * 统一的速率限制器配置
 */
export const rateLimiterConfigs = {
  imageGeneration: {
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 5,
    keyPrefix: 'rl:image:',
    message: '生成请求过于频繁，请稍后再试'
  },
  api: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 100,
    keyPrefix: 'rl:api:',
    message: 'API请求过于频繁'
  },
  auth: {
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5,
    keyPrefix: 'rl:auth:',
    message: '登录尝试过多，请稍后再试'
  },
  redeem: {
    windowMs: 60 * 60 * 1000, // 1小时
    maxRequests: 5,
    keyPrefix: 'rl:redeem:',
    message: '兑换码使用过于频繁，请稍后再试'
  }
} as const;

/**
 * 创建默认的速率限制器实例
 */
export const rateLimiters = {
  imageGeneration: createRateLimiter(rateLimiterConfigs.imageGeneration),
  api: createRateLimiter(rateLimiterConfigs.api),
  auth: createRateLimiter(rateLimiterConfigs.auth),
  redeem: createRateLimiter(rateLimiterConfigs.redeem)
};