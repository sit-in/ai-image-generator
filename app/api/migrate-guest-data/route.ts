import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// 使用服务角色密钥的 Supabase 客户端
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const { userId, guestImages } = await request.json()

    if (!userId || !guestImages || !Array.isArray(guestImages)) {
      return NextResponse.json(
        { error: '无效的请求参数' },
        { status: 400 }
      )
    }

    // 批量插入游客生成的图片到用户的历史记录
    const migratedImages = []
    
    for (const image of guestImages) {
      // 插入到 generation_history 表
      const { data: historyData, error: historyError } = await supabaseAdmin
        .from('generation_history')
        .insert({
          user_id: userId,
          prompt: image.prompt,
          style: image.style,
          image_url: image.url,
          created_at: image.createdAt || new Date().toISOString()
        })
        .select()
        .single()

      if (historyError) {
        console.error('迁移图片历史记录失败:', historyError)
        continue
      }

      migratedImages.push(historyData)
    }

    // 记录迁移日志
    console.log(`成功迁移 ${migratedImages.length} 张游客图片到用户 ${userId}`)

    return NextResponse.json({
      success: true,
      migratedCount: migratedImages.length,
      migratedImages
    })

  } catch (error) {
    console.error('迁移游客数据失败:', error)
    return NextResponse.json(
      { error: '迁移数据失败' },
      { status: 500 }
    )
  }
}