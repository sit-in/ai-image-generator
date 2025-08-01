import { NextRequest } from 'next/server';

/**
 * Edge Runtime 兼容的认证工具
 * 不使用 Node.js 特定的 API
 */

/**
 * 从请求中提取 JWT token (Edge 兼容版本)
 */
export function extractTokenEdge(request: NextRequest): string | null {
  // 1. 从 Authorization header 获取
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // 2. 从 cookie 获取
  let projectRef = '';
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const match = supabaseUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    projectRef = match ? match[1] : '';
  } catch (error) {
    console.error('Failed to parse Supabase URL:', error);
  }

  // 尝试获取 Supabase session cookie
  const sessionCookie = request.cookies.get(`sb-${projectRef}-auth-token`)?.value;
  if (sessionCookie) {
    try {
      // Supabase session cookie 是一个 JSON 对象
      const session = JSON.parse(sessionCookie);
      return session.access_token || null;
    } catch {
      // 如果不是 JSON，可能是直接的 token
      return sessionCookie;
    }
  }

  // 检查分片的 cookie
  const tokenPart0 = request.cookies.get(`sb-${projectRef}-auth-token.0`)?.value;
  const tokenPart1 = request.cookies.get(`sb-${projectRef}-auth-token.1`)?.value;
  if (tokenPart0) {
    // 重组分片的 token
    const fullToken = tokenPart0 + (tokenPart1 || '');
    try {
      const session = JSON.parse(fullToken);
      return session.access_token || null;
    } catch {
      return fullToken;
    }
  }

  return null;
}

/**
 * 简单的 JWT 解析（不验证签名）
 * 用于 Edge Runtime
 */
export function parseJWT(token: string): { sub?: string; exp?: number } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }

    // 解码 payload
    const payload = parts[1];
    const decoded = atob(payload.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * 检查 token 是否过期
 */
export function isTokenExpired(exp?: number): boolean {
  if (!exp) return true;
  return Date.now() >= exp * 1000;
}