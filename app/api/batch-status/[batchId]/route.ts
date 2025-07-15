import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { requireAuth } from '@/lib/auth-enhanced'

export async function GET(
  request: NextRequest,
  { params }: { params: { batchId: string } }
) {
  try {
    // 认证检查
    const authResult = await requireAuth(request as any)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user
    const { batchId } = params

    if (!batchId) {
      return NextResponse.json(
        { error: '缺少批量任务ID' },
        { status: 400 }
      )
    }

    // 获取批量任务信息
    const { data: batchGeneration, error: batchError } = await supabaseServer
      .from('batch_generations')
      .select('*')
      .eq('id', batchId)
      .eq('user_id', user.id) // 确保用户只能查看自己的任务
      .single()

    if (batchError || !batchGeneration) {
      return NextResponse.json(
        { error: '批量任务不存在或无权访问' },
        { status: 404 }
      )
    }

    // 获取所有子任务
    const { data: batchItems, error: itemsError } = await supabaseServer
      .from('batch_generation_items')
      .select('*')
      .eq('batch_id', batchId)
      .order('created_at')

    if (itemsError) {
      console.error('获取子任务失败:', itemsError)
      return NextResponse.json(
        { error: '获取子任务失败' },
        { status: 500 }
      )
    }

    // 统计进度
    const totalItems = batchItems?.length || 0
    const completedItems = batchItems?.filter(item => item.status === 'completed').length || 0
    const failedItems = batchItems?.filter(item => item.status === 'failed').length || 0
    const processingItems = batchItems?.filter(item => item.status === 'processing').length || 0
    const pendingItems = batchItems?.filter(item => item.status === 'pending').length || 0

    // 计算进度百分比
    const progressPercentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    // 估算剩余时间（基于平均处理时间）
    const avgTimePerImage = 30 // 秒
    const remainingItems = pendingItems + processingItems
    const estimatedTimeRemaining = remainingItems * avgTimePerImage

    return NextResponse.json({
      success: true,
      batch: {
        id: batchGeneration.id,
        prompt: batchGeneration.prompt,
        status: batchGeneration.status,
        totalCost: batchGeneration.total_cost,
        createdAt: batchGeneration.created_at,
        completedAt: batchGeneration.completed_at,
        errorMessage: batchGeneration.error_message
      },
      progress: {
        total: totalItems,
        completed: completedItems,
        failed: failedItems,
        processing: processingItems,
        pending: pendingItems,
        percentage: progressPercentage,
        estimatedTimeRemaining: estimatedTimeRemaining
      },
      items: batchItems?.map(item => ({
        id: item.id,
        style: item.style,
        status: item.status,
        imageUrl: item.image_url,
        errorMessage: item.error_message,
        startedAt: item.started_at,
        completedAt: item.completed_at
      })) || []
    })

  } catch (error) {
    console.error('获取批量生成状态失败:', error)
    
    return NextResponse.json(
      { error: '获取批量生成状态失败' },
      { status: 500 }
    )
  }
}