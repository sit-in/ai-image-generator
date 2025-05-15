import { supabaseServer } from '@/lib/supabase-server'
import { NextResponse } from 'next/server'

// 获取用户积分
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: '需要用户ID' }, { status: 400 })
    }

    // 获取用户积分
    const { data, error } = await supabaseServer
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single()

    if (error) {
      // 如果用户不存在，创建新用户
      if (error.code === 'PGRST116') {
        const { data: newUser, error: createError } = await supabaseServer
          .from('user_credits')
          .insert({ user_id: userId, credits: 0 })
          .select()
          .single()

        if (createError) {
          console.error('创建用户失败:', createError)
          return NextResponse.json({ error: '创建用户失败' }, { status: 500 })
        }

        return NextResponse.json({ credits: 0 })
      }

      console.error('获取积分失败:', error)
      return NextResponse.json({ error: '获取积分失败' }, { status: 500 })
    }

    return NextResponse.json({ credits: data?.credits || 0 })
  } catch (error) {
    console.error('处理请求失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 更新用户积分
export async function POST(request: Request) {
  try {
    const { userId, amount, description } = await request.json()

    if (!userId || amount === undefined) {
      return NextResponse.json({ error: '参数不完整' }, { status: 400 })
    }

    // 使用 upsert 更新积分
    const { data: userData, error: userError } = await supabaseServer
      .from('user_credits')
      .upsert(
        { 
          user_id: userId, 
          credits: amount 
        },
        {
          onConflict: 'user_id',
          ignoreDuplicates: false
        }
      )
      .select()
      .single()

    if (userError) {
      console.error('更新积分失败:', userError)
      return NextResponse.json({ error: '更新积分失败' }, { status: 500 })
    }

    // 记录历史
    const { error: historyError } = await supabaseServer
      .from('credit_history')
      .insert({
        user_id: userId,
        amount,
        description: description || '积分变更'
      })

    if (historyError) {
      console.error('记录历史失败:', historyError)
      return NextResponse.json({ error: '记录历史失败' }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true, 
      credits: userData?.credits || 0 
    })
  } catch (error) {
    console.error('处理请求失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}

// 获取积分历史
export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: '需要用户ID' }, { status: 400 })
    }

    const { data, error } = await supabaseServer
      .from('credit_history')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('获取历史记录失败:', error)
      return NextResponse.json({ error: '获取历史记录失败' }, { status: 500 })
    }

    return NextResponse.json({ history: data || [] })
  } catch (error) {
    console.error('处理请求失败:', error)
    return NextResponse.json({ error: '服务器错误' }, { status: 500 })
  }
}





