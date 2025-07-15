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
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status') // 可选的状态过滤

    // 验证分页参数
    if (page < 1 || limit < 1 || limit > 50) {
      return NextResponse.json(
        { error: '无效的分页参数' },
        { status: 400 }
      )
    }

    const offset = (page - 1) * limit

    // 构建查询条件
    let query = supabaseServer
      .from('batch_generations')
      .select(`
        *,
        batch_generation_items (
          id,
          style,
          status,
          image_url,
          error_message,
          completed_at
        )
      `, { count: 'exact' })
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    // 添加状态过滤
    if (status && ['pending', 'processing', 'completed', 'failed', 'cancelled'].includes(status)) {
      query = query.eq('status', status)
    }

    // 分页
    query = query.range(offset, offset + limit - 1)

    const { data: batchGenerations, error, count } = await query

    if (error) {
      console.error('获取批量任务列表失败:', error)
      return NextResponse.json(
        { error: '获取批量任务列表失败' },
        { status: 500 }
      )
    }

    // 格式化数据
    const formattedData = batchGenerations?.map(batch => {
      const items = batch.batch_generation_items || []
      const completedItems = items.filter((item: any) => item.status === 'completed').length
      const failedItems = items.filter((item: any) => item.status === 'failed').length
      const processingItems = items.filter((item: any) => item.status === 'processing').length
      const pendingItems = items.filter((item: any) => item.status === 'pending').length
      
      const progressPercentage = items.length > 0 ? 
        Math.round((completedItems / items.length) * 100) : 0

      return {
        id: batch.id,
        prompt: batch.prompt,
        status: batch.status,
        batchSize: batch.batch_size,
        styles: batch.styles,
        totalCost: batch.total_cost,
        createdAt: batch.created_at,
        completedAt: batch.completed_at,
        errorMessage: batch.error_message,
        progress: {
          total: items.length,
          completed: completedItems,
          failed: failedItems,
          processing: processingItems,
          pending: pendingItems,
          percentage: progressPercentage
        },
        completedImages: items
          .filter((item: any) => item.status === 'completed' && item.image_url)
          .map((item: any) => ({
            id: item.id,
            style: item.style,
            imageUrl: item.image_url,
            completedAt: item.completed_at
          }))
      }
    }) || []

    const totalPages = count ? Math.ceil(count / limit) : 0

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    })

  } catch (error) {
    console.error('获取批量任务列表失败:', error)
    
    return NextResponse.json(
      { error: '获取批量任务列表失败' },
      { status: 500 }
    )
  }
}