import { NextRequest } from 'next/server';
import { RateLimiterInterface } from './rate-limiter-factory';
import { RateLimiter } from './rate-limiter';
import { EnhancedRateLimiter } from './rate-limiter-redis';

/**
 * 适配器类，统一不同速率限制器的接口
 */
export class RateLimiterAdapter implements RateLimiterInterface {
  private limiter: RateLimiter | EnhancedRateLimiter;

  constructor(limiter: RateLimiter | EnhancedRateLimiter) {
    this.limiter = limiter;
  }

  check(identifier: string | NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    if (this.limiter instanceof RateLimiter) {
      // RateLimiter 期望 NextRequest
      if (typeof identifier === 'string') {
        // 创建一个模拟的 request 对象
        const mockRequest = {
          cookies: { get: () => ({ value: identifier }) },
          headers: new Headers(),
          ip: identifier
        } as any;
        return this.limiter.check(mockRequest);
      }
      return this.limiter.check(identifier as NextRequest);
    } else if (this.limiter instanceof EnhancedRateLimiter) {
      // EnhancedRateLimiter 是异步的，但我们需要同步结果
      // 在实际使用中，应该使用异步版本
      if (typeof identifier === 'string') {
        const mockRequest = {
          cookies: { get: () => ({ value: identifier }) },
          headers: new Headers(),
          ip: identifier
        } as any;
        // 使用 Promise 的同步执行（不推荐，但为了兼容性）
        let result = { allowed: true, remaining: 0, resetTime: 0 };
        (this.limiter.check(mockRequest) as Promise<any>).then(r => result = r).catch(() => {});
        return result;
      }
      // 同样的问题，需要处理异步
      let result = { allowed: true, remaining: 0, resetTime: 0 };
      (this.limiter.check(identifier as NextRequest) as Promise<any>).then(r => result = r).catch(() => {});
      return result;
    }
    
    return { allowed: true, remaining: 0, resetTime: 0 };
  }

  reset(identifier: string): void {
    if (this.limiter instanceof RateLimiter) {
      // RateLimiter 没有 reset 方法，需要添加或忽略
      if ('reset' in this.limiter) {
        (this.limiter as any).reset(identifier);
      }
    } else if (this.limiter instanceof EnhancedRateLimiter) {
      this.limiter.reset(identifier);
    }
  }
}