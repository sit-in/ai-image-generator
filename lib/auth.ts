import { NextRequest, NextResponse } from 'next/server';
import { supabaseServer } from './supabase-server';
import jwt from 'jsonwebtoken';

export interface DecodedToken {
  sub: string; // user id
  email?: string;
  role?: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
  };
  user_metadata?: {
    [key: string]: any;
  };
  aud?: string;
  exp?: number;
  iat?: number;
}

/**
 * 从请求中提取JWT token
 */
export function extractToken(request: NextRequest): string | null {
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
 * 验证JWT token并返回解码后的数据
 */
export async function verifyToken(token: string): Promise<DecodedToken | null> {
  try {
    // 使用 Supabase 的公钥验证（理想情况）
    // 但由于我们没有公钥，使用 Supabase SDK 验证
    const { data: { user }, error } = await supabaseServer.auth.getUser(token);
    
    if (error || !user) {
      console.error('Token verification failed:', error);
      return null;
    }

    // 尝试解码 JWT 获取更多信息（不验证签名）
    const decoded = jwt.decode(token) as DecodedToken;
    if (!decoded) {
      return null;
    }

    // 确保 token 包含用户 ID
    if (!decoded.sub || decoded.sub !== user.id) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error('Token verification error:', error);
    return null;
  }
}

/**
 * 检查用户是否是管理员
 */
export async function checkIsAdmin(userId: string): Promise<boolean> {
  try {
    const { data: profile, error } = await supabaseServer
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single();

    if (error || !profile) {
      console.error('Failed to check admin status:', error);
      return false;
    }

    return profile.is_admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

/**
 * 验证管理员权限的中间件函数
 */
export async function requireAdmin(request: NextRequest): Promise<{ authorized: boolean; response?: NextResponse }> {
  // 1. 提取 token
  const token = extractToken(request);
  if (!token) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: '未授权：缺少认证令牌' },
        { status: 401 }
      )
    };
  }

  // 2. 验证 token
  const decoded = await verifyToken(token);
  if (!decoded || !decoded.sub) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: '未授权：无效的认证令牌' },
        { status: 401 }
      )
    };
  }

  // 3. 检查是否是管理员
  const isAdmin = await checkIsAdmin(decoded.sub);
  if (!isAdmin) {
    return {
      authorized: false,
      response: NextResponse.json(
        { error: '禁止访问：需要管理员权限' },
        { status: 403 }
      )
    };
  }

  return { authorized: true };
}

/**
 * 获取当前用户信息
 */
export async function getCurrentUser(request: NextRequest): Promise<{ userId: string; isAdmin: boolean } | null> {
  const token = extractToken(request);
  if (!token) {
    return null;
  }

  const decoded = await verifyToken(token);
  if (!decoded || !decoded.sub) {
    return null;
  }

  const isAdmin = await checkIsAdmin(decoded.sub);
  return {
    userId: decoded.sub,
    isAdmin
  };
}