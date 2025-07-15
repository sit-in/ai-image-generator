import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireAuth } from '@/lib/auth-enhanced'

export async function GET(request: NextRequest) {
  try {
    // 认证检查
    const authResult = await requireAuth(request as any)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user

    // 获取生成历史
    const { data, error } = await supabaseServer
      .from('generation_history')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('获取生成历史失败:', error)
      return NextResponse.json(
        { error: '获取生成历史失败: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      data: data || []
    })

  } catch (error) {
    console.error('生成历史API错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // 认证检查
    const authResult = await requireAuth(request as any)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user
    const url = new URL(request.url)
    const recordId = url.searchParams.get('id')

    if (!recordId) {
      return NextResponse.json(
        { error: '缺少记录ID' },
        { status: 400 }
      )
    }

    // 删除记录（只能删除自己的）
    const { error } = await supabaseServer
      .from('generation_history')
      .delete()
      .eq('id', recordId)
      .eq('user_id', user.id) // 确保只能删除自己的记录

    if (error) {
      console.error('删除记录失败:', error)
      return NextResponse.json(
        { error: '删除记录失败: ' + error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '记录已删除'
    })

  } catch (error) {
    console.error('删除记录API错误:', error)
    return NextResponse.json(
      { error: '服务器错误' },
      { status: 500 }
    )
  }
}