import { supabaseServer } from '@/lib/supabase-server'

export interface QueueItem {
  id: string
  batchId: string
  priority: number
  createdAt: Date
  retryCount: number
  maxRetries: number
}

export class BatchQueue {
  private static instance: BatchQueue
  private isProcessing = false
  private maxConcurrent = 2 // 最大并发处理数
  private currentProcessing = 0
  private processingInterval: NodeJS.Timeout | null = null

  private constructor() {
    // 启动定期检查队列
    this.startQueueProcessor()
  }

  static getInstance(): BatchQueue {
    if (!BatchQueue.instance) {
      BatchQueue.instance = new BatchQueue()
    }
    return BatchQueue.instance
  }

  // 启动队列处理器
  private startQueueProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
    }

    this.processingInterval = setInterval(async () => {
      await this.processQueue()
    }, 5000) // 每5秒检查一次队列
  }

  // 停止队列处理器
  stopQueueProcessor() {
    if (this.processingInterval) {
      clearInterval(this.processingInterval)
      this.processingInterval = null
    }
  }

  // 处理队列
  private async processQueue() {
    if (this.currentProcessing >= this.maxConcurrent) {
      return // 已达到最大并发数
    }

    try {
      // 获取待处理的批量任务
      const { data: pendingBatches, error } = await supabaseServer
        .from('batch_generations')
        .select('*')
        .eq('status', 'pending')
        .order('created_at')
        .limit(this.maxConcurrent - this.currentProcessing)

      if (error) {
        console.error('获取待处理批量任务失败:', error)
        return
      }

      if (!pendingBatches || pendingBatches.length === 0) {
        return // 没有待处理的任务
      }

      // 处理每个批量任务
      for (const batch of pendingBatches) {
        if (this.currentProcessing >= this.maxConcurrent) {
          break
        }

        this.currentProcessing++
        this.processBatch(batch.id).finally(() => {
          this.currentProcessing--
        })
      }

    } catch (error) {
      console.error('队列处理错误:', error)
    }
  }

  // 处理单个批量任务
  private async processBatch(batchId: string) {
    try {
      console.log(`开始处理批量任务: ${batchId}`)
      
      // 更新状态为处理中
      await supabaseServer
        .from('batch_generations')
        .update({ status: 'processing' })
        .eq('id', batchId)

      // 获取批量任务信息
      const { data: batch, error: batchError } = await supabaseServer
        .from('batch_generations')
        .select('*')
        .eq('id', batchId)
        .single()

      if (batchError || !batch) {
        throw new Error(`获取批量任务失败: ${batchError?.message}`)
      }

      // 获取所有待处理的子任务
      const { data: items, error: itemsError } = await supabaseServer
        .from('batch_generation_items')
        .select('*')
        .eq('batch_id', batchId)
        .eq('status', 'pending')

      if (itemsError) {
        throw new Error(`获取子任务失败: ${itemsError?.message}`)
      }

      if (!items || items.length === 0) {
        // 检查是否所有子任务都已完成
        const { data: allItems } = await supabaseServer
          .from('batch_generation_items')
          .select('status')
          .eq('batch_id', batchId)

        const completedCount = allItems?.filter(item => item.status === 'completed').length || 0
        const failedCount = allItems?.filter(item => item.status === 'failed').length || 0
        const totalCount = allItems?.length || 0

        if (completedCount + failedCount === totalCount) {
          const finalStatus = failedCount === 0 ? 'completed' : 'completed'
          await supabaseServer
            .from('batch_generations')
            .update({ 
              status: finalStatus,
              completed_at: new Date().toISOString()
            })
            .eq('id', batchId)
        }
        return
      }

      // 逐个处理子任务
      let successCount = 0
      let failureCount = 0

      for (const item of items) {
        try {
          await this.processGenerationItem(batch, item)
          successCount++
          
          // 在每个子任务之间添加延迟，避免API过载
          await new Promise(resolve => setTimeout(resolve, 2000))
          
        } catch (error) {
          console.error(`子任务处理失败: ${item.id}`, error)
          failureCount++
          
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

      // 检查是否所有子任务都已处理完成
      const { data: finalItems } = await supabaseServer
        .from('batch_generation_items')
        .select('status')
        .eq('batch_id', batchId)

      const finalCompletedCount = finalItems?.filter(item => item.status === 'completed').length || 0
      const finalFailedCount = finalItems?.filter(item => item.status === 'failed').length || 0
      const finalTotalCount = finalItems?.length || 0

      if (finalCompletedCount + finalFailedCount === finalTotalCount) {
        const finalStatus = finalFailedCount === 0 ? 'completed' : 'completed'
        await supabaseServer
          .from('batch_generations')
          .update({ 
            status: finalStatus,
            completed_at: new Date().toISOString()
          })
          .eq('id', batchId)

        console.log(`批量任务完成: ${batchId}, 成功: ${finalCompletedCount}, 失败: ${finalFailedCount}`)
      }

    } catch (error) {
      console.error(`批量任务处理失败: ${batchId}`, error)
      
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
  private async processGenerationItem(batch: any, item: any) {
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
    const styledPrompt = `${styleDesc}, ${batch.prompt}, high quality`

    console.log(`生成图片: ${item.id}, 风格: ${item.style}`)

    // 生成图片
    const model = (process.env.REPLICATE_MODEL as `${string}/${string}`) || "black-forest-labs/flux-schnell"
    const output = await replicate.run(model, { 
      input: { prompt: styledPrompt }
    })
    
    const imageUrl = Array.isArray(output) ? output[0] : output
    if (!imageUrl) {
      throw new Error('未收到图片URL')
    }

    // 保存图片到 Supabase Storage
    const { publicUrl, storagePath } = await saveImageToStorage(imageUrl, batch.user_id)

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
        user_id: batch.user_id,
        prompt: batch.prompt,
        image_url: publicUrl,
        storage_path: storagePath,
        parameters: {
          style: item.style,
          model,
          size: '1024x1024',
          quality: 'standard',
          batchId: batch.id
        }
      })

    console.log(`图片生成完成: ${item.id}`)
  }

  // 获取队列状态
  async getQueueStatus() {
    try {
      const { data: pendingBatches, error: pendingError } = await supabaseServer
        .from('batch_generations')
        .select('id, created_at')
        .eq('status', 'pending')
        .order('created_at')

      const { data: processingBatches, error: processingError } = await supabaseServer
        .from('batch_generations')
        .select('id, created_at')
        .eq('status', 'processing')

      if (pendingError || processingError) {
        throw new Error('获取队列状态失败')
      }

      return {
        pending: pendingBatches?.length || 0,
        processing: processingBatches?.length || 0,
        maxConcurrent: this.maxConcurrent,
        currentProcessing: this.currentProcessing
      }
    } catch (error) {
      console.error('获取队列状态失败:', error)
      return {
        pending: 0,
        processing: 0,
        maxConcurrent: this.maxConcurrent,
        currentProcessing: this.currentProcessing
      }
    }
  }

  // 取消批量任务
  async cancelBatch(batchId: string, userId: string) {
    try {
      // 验证任务属于该用户
      const { data: batch, error: batchError } = await supabaseServer
        .from('batch_generations')
        .select('status')
        .eq('id', batchId)
        .eq('user_id', userId)
        .single()

      if (batchError || !batch) {
        throw new Error('批量任务不存在或无权访问')
      }

      if (batch.status === 'completed' || batch.status === 'failed') {
        throw new Error('无法取消已完成或失败的任务')
      }

      // 更新批量任务状态
      await supabaseServer
        .from('batch_generations')
        .update({ 
          status: 'cancelled',
          completed_at: new Date().toISOString()
        })
        .eq('id', batchId)

      // 取消所有待处理的子任务
      await supabaseServer
        .from('batch_generation_items')
        .update({ 
          status: 'failed',
          error_message: '用户取消',
          completed_at: new Date().toISOString()
        })
        .eq('batch_id', batchId)
        .in('status', ['pending', 'processing'])

      return { success: true }
    } catch (error) {
      console.error('取消批量任务失败:', error)
      throw error
    }
  }
}

// 导出单例实例
export const batchQueue = BatchQueue.getInstance()

// 在应用启动时启动队列处理器
if (typeof window === 'undefined') {
  // 只在服务器端启动
  batchQueue
}