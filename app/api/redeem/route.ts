import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { validateRedeemCode } from '@/lib/redeem-utils'
import { createRateLimitResponse } from '@/lib/rate-limiter'
import { schemas, validateInput, sanitizeInput, logSecurityEvent, rateLimiters } from '@/lib/security'
import { rateLimiterConfigs } from '@/lib/rate-limiter-factory'
import { requireAuth } from '@/lib/auth-enhanced'

export async function POST(req: Request) {
  try {
    // 速率限制检查
    const rateLimitResult = rateLimiters.redeem.check(req as any);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimiterConfigs.redeem.message || '兑换请求过于频繁',
        rateLimitResult.resetTime
      );
    }

    const body = await req.json()
    const { code } = body;

    // 输入验证
    const validation = validateInput(schemas.redeemCode, { code });
    if (!validation.success) {
      logSecurityEvent({
        type: 'input_validation_failed',
        ip: req.headers.get('x-forwarded-for') || 'unknown',
        userAgent: req.headers.get('user-agent') || 'unknown',
        details: { error: validation.error, input: body }
      });
      
      return NextResponse.json({ success: false, message: validation.error }, { status: 400 })
    }

    // 认证检查
    const authResult = await requireAuth(req as any);
    if (!authResult.success) {
      return NextResponse.json({ success: false, message: authResult.error }, { status: 401 });
    }

    const user = authResult.user;
    const sanitizedCode = sanitizeInput(code);

    // 查找兑换码
    const { data: redeem, error } = await supabaseServer
      .from('redeem_codes')
      .select('*')
      .eq('code', sanitizedCode)
      .single()

    if (error || !redeem) {
      return NextResponse.json({ success: false, message: '兑换码无效' }, { status: 400 })
    }
    if (redeem.used) {
      return NextResponse.json({ success: false, message: '兑换码已被使用' }, { status: 400 })
    }
    
    // 检查兑换码是否过期
    if (redeem.expires_at && new Date(redeem.expires_at) < new Date()) {
      return NextResponse.json({ success: false, message: '兑换码已过期' }, { status: 400 })
    }

    // 获取当前积分
    const { data: currentCredits, error: getCreditsError } = await supabaseServer
      .from('user_credits')
      .select('credits')
      .eq('user_id', user.id)
      .single()

    if (getCreditsError) {
      console.error('获取当前积分失败:', getCreditsError)
      return NextResponse.json({ success: false, message: '获取积分失败' }, { status: 500 })
    }

    // 给用户加积分
    const { error: creditError } = await supabaseServer
      .from('user_credits')
      .update({ credits: (currentCredits?.credits || 0) + redeem.amount })
      .eq('user_id', user.id)
    if (creditError) {
      console.error('积分充值失败:', creditError)
      return NextResponse.json({ success: false, message: '积分充值失败' }, { status: 500 })
    }

    // 标记兑换码已用
    const { error: updateError } = await supabaseServer
      .from('redeem_codes')
      .update({ 
        used: true, 
        used_by: user.id, 
        used_at: new Date().toISOString() 
      })
      .eq('id', redeem.id)
      .select()

    if (updateError) {
      console.error('更新兑换码状态失败:', updateError)
      // 如果更新状态失败，需要回滚积分
      const { error: rollbackError } = await supabaseServer
        .from('user_credits')
        .update({ credits: currentCredits?.credits || 0 })
        .eq('user_id', user.id)
      
      if (rollbackError) {
        console.error('回滚积分失败:', rollbackError)
      }
      
      return NextResponse.json({ 
        success: false, 
        message: '兑换失败，请稍后重试',
        error: updateError.message 
      }, { status: 500 })
    }

    // 记录积分历史
    const { error: historyError } = await supabaseServer
      .from('credit_history')
      .insert({
        user_id: user.id,
        amount: redeem.amount,
        description: `使用${redeem.type}兑换码充值`
      })

    if (historyError) {
      console.error('记录积分历史失败:', historyError)
    }

    // 记录安全事件
    logSecurityEvent({
      type: 'suspicious_activity',
      userId: user.id,
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      details: { action: 'redeem_code_used', code: sanitizedCode, amount: redeem.amount }
    });

    const response = NextResponse.json({ 
      success: true, 
      amount: redeem.amount,
      code: redeem.code
    });

    // 添加速率限制头部
    response.headers.set('X-RateLimit-Limit', rateLimiterConfigs.redeem.maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    
    return response;
  } catch (error) {
    console.error('处理兑换请求失败:', error)
    
    logSecurityEvent({
      type: 'suspicious_activity',
      ip: req.headers.get('x-forwarded-for') || 'unknown',
      userAgent: req.headers.get('user-agent') || 'unknown',
      details: { action: 'redeem_code_error', error: error instanceof Error ? error.message : 'unknown' }
    });
    
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 })
  }
} 