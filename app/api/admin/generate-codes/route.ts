import { NextResponse, NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { generateRedeemCode, getAmountByType, RedeemCodeType } from '@/lib/redeem-utils'
import { requireAdmin } from '@/lib/auth'

export async function POST(req: NextRequest) {
  // 验证管理员权限
  const { authorized, response } = await requireAdmin(req)
  if (!authorized && response) {
    return response
  }

  try {
    const { type, count, expiresInDays = 30 } = await req.json()
    
    if (!['BASIC', 'STANDARD', 'PREMIUM'].includes(type)) {
      return NextResponse.json({ success: false, message: '无效的兑换码类型' }, { status: 400 })
    }

    const codes = Array(count).fill(0).map(() => ({
      code: generateRedeemCode(type as RedeemCodeType),
      amount: getAmountByType(type as RedeemCodeType),
      type,
      expires_at: new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString(),
      used: false
    }))

    const { data, error } = await supabaseServer
      .from('redeem_codes')
      .insert(codes)
      .select()

    if (error) {
      console.error('生成兑换码失败:', error)
      return NextResponse.json({ success: false, message: '生成兑换码失败' }, { status: 500 })
    }

    return NextResponse.json({ success: true, codes: data })
  } catch (error) {
    console.error('处理请求失败:', error)
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 })
  }
} 