import { NextResponse } from 'next/server'
import { NextRequest } from 'next/server'
import { supabaseServer } from '@/lib/supabase-server'
import { checkCredits, deductCredits } from '@/lib/credits'
import { rateLimiters, createRateLimitResponse } from '@/lib/rate-limiter'
import { schemas, validateInput, sanitizeInput, containsSensitiveWords, logSecurityEvent } from '@/lib/security'
import { requireAuth } from '@/lib/auth-enhanced'
import { z } from 'zod'

// 批量生成验证模式
const batchGenerationSchema = z.object({
  prompt: z.string()
    .min(1, '提示词不能为空')
    .max(1000, '提示词不能超过1000字符'),
  styles: z.array(z.enum(['natural', 'anime', 'oil', 'watercolor', 'pixel', 'ghibli']))
    .min(1, '至少选择一种风格')
    .max(10, '最多选择10种风格'),
  batchSize: z.number()
    .min(1, '批量大小至少为1')
    .max(10, '批量大小最多为10')
    .optional()
    .default(1)
})

export async function POST(request: NextRequest) {
  try {
    // 速率限制检查（使用更严格的限制）
    const rateLimitResult = rateLimiters.imageGeneration.check(request as any)
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        '批量生成请求过于频繁，请稍后再试',
        rateLimitResult.resetTime
      )
    }

    const body = await request.json()
    const { prompt, styles, batchSize = styles.length } = body

    // 输入验证
    const validation = validateInput(batchGenerationSchema, {
      prompt,
      styles,
      batchSize
    })

    if (!validation.success) {
      logSecurityEvent({
        type: 'input_validation_failed',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { error: validation.error, input: body }
      })
      
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      )
    }

    // 认证检查
    const authResult = await requireAuth(request as any)
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: 401 })
    }

    const user = authResult.user
    const sanitizedPrompt = sanitizeInput(prompt)

    // 内容安全检查
    if (containsSensitiveWords(sanitizedPrompt)) {
      logSecurityEvent({
        type: 'suspicious_activity',
        userId: user.id,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { prompt: sanitizedPrompt, reason: 'sensitive_words' }
      })
      
      return NextResponse.json(
        { error: '提示词包含敏感内容，请修改后重试' },
        { status: 400 }
      )
    }

    // 计算总积分消耗（每张图片10积分）
    const totalCost = styles.length * 10

    // 检查积分
    const credits = await checkCredits(user.id)
    if (credits === undefined) {
      return NextResponse.json(
        { error: '无法获取积分信息' },
        { status: 500 }
      )
    }
    if (credits < totalCost) {
      return NextResponse.json(
        { error: `积分不足，需要${totalCost}积分，当前只有${credits}积分` },
        { status: 403 }
      )
    }

    // 预扣积分
    const deductResult = await deductCredits(user.id, totalCost)
    if (!deductResult.success) {
      return NextResponse.json(
        { error: '扣除积分失败', details: deductResult.error },
        { status: 500 }
      )
    }

    // 先检查表是否存在
    const { data: tableCheck, error: tableCheckError } = await supabaseServer
      .from('batch_generations')
      .select('id')
      .limit(1)
    
    if (tableCheckError && tableCheckError.code === '42P01') {
      console.error('batch_generations 表不存在，请先运行数据库迁移')
      return NextResponse.json(
        { 
          error: '批量生成功能尚未初始化',
          details: '请联系管理员运行数据库迁移脚本'
        },
        { status: 503 }
      )
    }
    
    // 创建批量生成任务
    const { data: batchGeneration, error: batchError } = await supabaseServer
      .from('batch_generations')
      .insert({
        user_id: user.id,
        prompt: sanitizedPrompt,
        batch_size: styles.length,
        styles: styles,
        total_cost: totalCost,
        status: 'pending'
      })
      .select()
      .single()

    if (batchError) {
      console.error('创建批量生成任务失败:', batchError)
      console.error('批量生成任务详情:', {
        user_id: user.id,
        prompt: sanitizedPrompt,
        batch_size: styles.length,
        styles: styles,
        total_cost: totalCost,
        status: 'pending'
      })
      
      // 回滚积分
      await supabaseServer
        .from('user_credits')
        .update({ credits: credits })
        .eq('user_id', user.id)
      
      return NextResponse.json(
        { error: '创建批量生成任务失败', details: batchError.message },
        { status: 500 }
      )
    }

    // 创建子任务
    const batchItems = styles.map((style: string) => ({
      batch_id: batchGeneration.id,
      style: style,
      status: 'pending'
    }))

    const { error: itemsError } = await supabaseServer
      .from('batch_generation_items')
      .insert(batchItems)

    if (itemsError) {
      console.error('创建批量生成子任务失败:', itemsError)
      console.error('子任务详情:', batchItems)
      
      // 删除批量任务并回滚积分
      await supabaseServer
        .from('batch_generations')
        .delete()
        .eq('id', batchGeneration.id)
      
      await supabaseServer
        .from('user_credits')
        .update({ credits: credits })
        .eq('user_id', user.id)
      
      return NextResponse.json(
        { error: '创建批量生成子任务失败', details: itemsError.message },
        { status: 500 }
      )
    }

    // 启动批量生成处理（异步）
    // 这里我们触发后台处理，但不等待完成
    processBatchGeneration(batchGeneration.id).catch(console.error)

    // 记录安全事件
    logSecurityEvent({
      type: 'suspicious_activity',
      userId: user.id,
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { 
        action: 'batch_generation_started', 
        batchId: batchGeneration.id,
        prompt: sanitizedPrompt,
        styles: styles,
        totalCost: totalCost
      }
    })

    const response = NextResponse.json({
      success: true,
      batchId: batchGeneration.id,
      totalCost: totalCost,
      estimatedTime: styles.length * 30, // 每张图片预估30秒
      message: `批量生成任务已创建，将生成${styles.length}张图片`
    })

    // 添加速率限制头部
    response.headers.set('X-RateLimit-Limit', rateLimiters.imageGeneration['config'].maxRequests.toString())
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString())
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())
    
    return response

  } catch (error) {
    console.error('批量生成请求失败:', error)
    console.error('错误堆栈:', error instanceof Error ? error.stack : 'No stack trace')
    
    logSecurityEvent({
      type: 'suspicious_activity',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { action: 'batch_generation_error', error: error instanceof Error ? error.message : 'unknown' }
    })
    
    return NextResponse.json(
      { 
        error: '批量生成请求失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
}

// 异步处理批量生成
async function processBatchGeneration(batchId: string) {
  try {
    console.log(`开始处理批量生成任务: ${batchId}`)
    
    // 更新批量任务状态为处理中
    await supabaseServer
      .from('batch_generations')
      .update({ status: 'processing' })
      .eq('id', batchId)

    // 获取批量任务信息
    const { data: batchGeneration, error: batchError } = await supabaseServer
      .from('batch_generations')
      .select('*')
      .eq('id', batchId)
      .single()

    if (batchError || !batchGeneration) {
      throw new Error(`获取批量任务失败: ${batchError?.message}`)
    }

    // 获取所有子任务
    const { data: batchItems, error: itemsError } = await supabaseServer
      .from('batch_generation_items')
      .select('*')
      .eq('batch_id', batchId)
      .eq('status', 'pending')

    if (itemsError || !batchItems) {
      throw new Error(`获取子任务失败: ${itemsError?.message}`)
    }

    let completedCount = 0
    let failedCount = 0

    // 逐个处理子任务（避免并发过载）
    for (const item of batchItems) {
      try {
        await processGenerationItem(batchGeneration, item)
        completedCount++
      } catch (error) {
        console.error(`子任务处理失败: ${item.id}`, error)
        failedCount++
        
        // 更新子任务状态为失败
        await supabaseServer
          .from('batch_generation_items')
          .update({ 
            status: 'failed', 
            error_message: error instanceof Error ? error.message : '未知错误',
            completed_at: new Date().toISOString()
          })
          .eq('id', item.id)
      }
    }

    // 更新批量任务最终状态
    const finalStatus = failedCount === 0 ? 'completed' : 
                       completedCount === 0 ? 'failed' : 'completed'
    
    await supabaseServer
      .from('batch_generations')
      .update({ 
        status: finalStatus,
        completed_at: new Date().toISOString()
      })
      .eq('id', batchId)

    console.log(`批量生成任务完成: ${batchId}, 成功: ${completedCount}, 失败: ${failedCount}`)

  } catch (error) {
    console.error(`批量生成任务处理失败: ${batchId}`, error)
    
    // 更新批量任务状态为失败
    await supabaseServer
      .from('batch_generations')
      .update({ 
        status: 'failed',
        error_message: error instanceof Error ? error.message : '未知错误',
        completed_at: new Date().toISOString()
      })
      .eq('id', batchId)
  }
}

// 处理单个生成项
async function processGenerationItem(batchGeneration: any, item: any) {
  const Replicate = require('replicate')
  const { saveImageToStorage } = require('@/lib/storage')
  
  // 更新子任务状态为处理中
  await supabaseServer
    .from('batch_generation_items')
    .update({ 
      status: 'processing',
      started_at: new Date().toISOString()
    })
    .eq('id', item.id)

  const replicate = new Replicate({
    auth: process.env.REPLICATE_API_TOKEN,
  })

  // 构建提示词
  const styleDescriptions = {
    'anime': 'anime style',
    'oil': 'oil painting style',  
    'watercolor': 'watercolor painting style',
    'pixel': 'pixel art style',
    'ghibli': 'Studio Ghibli style',
    'natural': 'realistic style'
  }
  
  const styleDesc = styleDescriptions[item.style as keyof typeof styleDescriptions] || styleDescriptions.natural
  const styledPrompt = `${styleDesc}, ${batchGeneration.prompt}, high quality`

  console.log(`生成图片: ${item.id}, 提示词: ${styledPrompt}`)

  // 生成图片
  const model = (process.env.REPLICATE_MODEL as `${string}/${string}`) || "black-forest-labs/flux-schnell"
  
  let output;
  try {
    output = await replicate.run(model, { 
      input: { prompt: styledPrompt }
    })
  } catch (error: any) {
    // 处理 Replicate API 错误
    if (error.message?.includes('502') || error.message?.includes('Bad Gateway')) {
      throw new Error('AI图片生成服务暂时不可用，请稍后再试')
    }
    if (error.message?.includes('timeout') || error.message?.includes('ETIMEDOUT')) {
      throw new Error('图片生成超时，请重试')
    }
    if (error.message?.includes('NSFW')) {
      throw new Error('生成的内容被检测为不适合的内容，请尝试使用不同的描述')
    }
    throw error
  }
  
  const imageUrl = Array.isArray(output) ? output[0] : output
  if (!imageUrl) {
    throw new Error('未收到图片URL')
  }

  // 保存图片到 Supabase Storage
  const { publicUrl, storagePath } = await saveImageToStorage(imageUrl, batchGeneration.user_id)

  // 更新子任务状态为完成
  await supabaseServer
    .from('batch_generation_items')
    .update({ 
      status: 'completed',
      image_url: publicUrl,
      storage_path: storagePath,
      completed_at: new Date().toISOString()
    })
    .eq('id', item.id)

  // 保存到生成历史
  await supabaseServer
    .from('generation_history')
    .insert({
      user_id: batchGeneration.user_id,
      prompt: batchGeneration.prompt,
      image_url: publicUrl,
      storage_path: storagePath,
      parameters: {
        style: item.style,
        model,
        size: '1024x1024',
        quality: 'standard',
        batchId: batchGeneration.id
      }
    })

  console.log(`图片生成完成: ${item.id}`)
}