import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { requireAuth } from '@/lib/auth-enhanced'
import { batchQueue } from '@/lib/batch-queue'

export async function POST(
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

    // 取消批量任务
    await batchQueue.cancelBatch(batchId, user.id)

    return NextResponse.json({
      success: true,
      message: '批量任务已取消'
    })

  } catch (error) {
    console.error('取消批量任务失败:', error)
    
    const errorMessage = error instanceof Error ? error.message : '取消批量任务失败'
    const statusCode = errorMessage.includes('不存在') || errorMessage.includes('无权访问') ? 404 : 500
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
}