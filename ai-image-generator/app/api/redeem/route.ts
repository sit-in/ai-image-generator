import { NextResponse } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  try {
    const { code } = await req.json()
    
    // 从 Authorization header 中获取 token
    const authHeader = req.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('缺少认证 token')
      return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    }
    
    const token = authHeader.split(' ')[1]
    
    // 设置认证信息
    const { data: { user }, error: authError } = await supabaseServer.auth.getUser(token)
    
    if (authError) {
      console.error('认证检查失败:', authError)
      return NextResponse.json({ success: false, message: '认证检查失败' }, { status: 401 })
    }
    
    if (!user) {
      return NextResponse.json({ success: false, message: '未登录' }, { status: 401 })
    }

    // 查找兑换码
    const { data: redeem, error } = await supabaseServer
      .from('redeem_codes')
      .select('*')
      .eq('code', code)
      .single()

    if (error || !redeem) {
      return NextResponse.json({ success: false, message: '兑换码无效' }, { status: 400 })
    }
    if (redeem.used) {
      return NextResponse.json({ success: false, message: '兑换码已被使用' }, { status: 400 })
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
    await supabaseServer
      .from('redeem_codes')
      .update({ used: true, used_by: user.id, used_at: new Date().toISOString() })
      .eq('id', redeem.id)

    return NextResponse.json({ success: true, amount: redeem.amount })
  } catch (error) {
    console.error('处理兑换请求失败:', error)
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 })
  }
} 