import { NextResponse, NextRequest } from 'next/server';
import { requireAdmin, getCurrentUser } from '@/lib/auth';

export async function GET(request: NextRequest) {
  // 测试获取当前用户信息
  const user = await getCurrentUser(request);
  
  if (!user) {
    return NextResponse.json({
      authenticated: false,
      message: '未登录'
    }, { status: 401 });
  }

  // 测试管理员权限验证
  const { authorized, response } = await requireAdmin(request);
  
  if (!authorized && response) {
    return NextResponse.json({
      authenticated: true,
      userId: user.userId,
      isAdmin: false,
      message: '不是管理员'
    }, { status: 403 });
  }

  return NextResponse.json({
    authenticated: true,
    userId: user.userId,
    isAdmin: user.isAdmin,
    message: '管理员验证成功'
  });
}