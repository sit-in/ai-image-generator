import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { checkCredits, deductCredits } from '@/lib/credits';
import { saveImageToStorage } from '@/lib/storage';
import { schemas, validateInput, sanitizeInput, containsSensitiveWords, logSecurityEvent } from '@/lib/security';
import { checkRateLimit, createRateLimitResponse } from '@/lib/rate-limiter-wrapper';
import Replicate from "replicate";
import { PromptOptimizer } from '@/lib/prompt-optimizer';
import { generateGuestFingerprint, checkGuestTrialStatus, markGuestTrialUsed } from '@/lib/guest-tracking';

export async function POST(request: Request) {
  try {
    // 速率限制检查
    const rateLimitResult = checkRateLimit(request, {
      windowMs: 60 * 1000, // 1分钟
      maxRequests: 5 // 最多5次请求
    });
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        '请求过于频繁，请稍后再试',
        rateLimitResult.resetTime
      );
    }

    const body = await request.json();
    const { prompt, userId, style = 'natural', isGuest = false } = body;

    // 输入验证
    const validation = validateInput(schemas.imageGeneration, {
      prompt,
      style,
      size: '1024x1024',
      quality: 'standard'
    });

    if (!validation.success) {
      logSecurityEvent({
        type: 'input_validation_failed',
        userId,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { error: validation.error, input: body }
      });
      
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // 游客模式处理
    if (isGuest) {
      // 游客模式不需要userId和认证
      console.log('游客模式生成图片');
      console.log('游客请求参数:', { prompt, style, isGuest });
      
      // 服务端验证游客试用状态
      const guestFingerprint = generateGuestFingerprint(request);
      const { hasUsedTrial, usedAt } = await checkGuestTrialStatus(guestFingerprint);
      
      if (hasUsedTrial) {
        return NextResponse.json(
          { 
            error: '您已经使用过免费试用机会', 
            details: '请注册账号以继续使用',
            usedAt: usedAt?.toISOString()
          },
          { status: 403 }
        );
      }
    } else {
      // 注册用户模式需要验证
      if (!userId) {
        return NextResponse.json(
          { error: '用户未登录' },
          { status: 401 }
        );
      }

      // 验证用户session
      const authHeader = request.headers.get('authorization');
      const token = authHeader?.replace('Bearer ', '');
      
      if (!token) {
        return NextResponse.json(
          { error: '缺少认证token' },
          { status: 401 }
        );
      }

      const { data: { user }, error: userError } = await supabaseServer.auth.getUser(token);
      if (userError || !user || user.id !== userId) {
        return NextResponse.json(
          { error: '用户身份验证失败' },
          { status: 401 }
        );
      }
    }

    // 内容安全检查
    const sanitizedPrompt = sanitizeInput(prompt);
    if (containsSensitiveWords(sanitizedPrompt)) {
      logSecurityEvent({
        type: 'suspicious_activity',
        userId: userId || 'guest',
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { prompt: sanitizedPrompt, reason: 'sensitive_words' }
      });
      
      return NextResponse.json(
        { error: '提示词包含敏感内容，请修改后重试' },
        { status: 400 }
      );
    }

    // 检查积分（游客模式跳过）
    if (!isGuest) {
      const credits = await checkCredits(userId);
      if (credits === undefined) {
        return NextResponse.json(
          { error: '无法获取积分信息' },
          { status: 500 }
        );
      }
      if (credits < 10) {
        return NextResponse.json(
          { error: '积分不足，无法生成图片' },
          { status: 403 }
        );
      }
    }

    // === 用 Replicate 生成图片 ===
    console.log('开始调用Replicate API...');
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // 使用提示词优化器处理中英文混合输入
    const { optimizedPrompt, translatedPrompt, suggestions } = PromptOptimizer.optimize(sanitizedPrompt, style);
    
    // 使用优化后的提示词
    let styledPrompt = optimizedPrompt;

    // 调试日志 - 打印实际发送的提示词
    console.log('原始提示词:', prompt);
    console.log('翻译后提示词:', translatedPrompt);
    console.log('风格:', style);
    console.log('最终优化提示词:', styledPrompt);
    console.log('优化建议:', suggestions);

    const input = { prompt: styledPrompt };
    // Replicate 只接受 'owner/model' 或 'owner/model:version' 形式
    const model = (process.env.REPLICATE_MODEL as `${string}/${string}`) || "black-forest-labs/flux-schnell";
    console.log('调用Replicate模型:', model, '输入:', input);
    
    const output = await replicate.run(model, { input });
    
    // 处理不同类型的输出
    let imageUrl: string;
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else if (output && typeof output === 'object' && 'readable' in output) {
      // 处理 ReadableStream
      const stream = output as any;
      const chunks = [];
      const reader = stream.getReader();
      
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
      }
      
      // 将 chunks 转换为字符串
      const text = new TextDecoder().decode(Buffer.concat(chunks));
      imageUrl = text.trim();
    } else {
      imageUrl = String(output);
    }
    
    console.log('Replicate返回结果:', output);
    console.log('提取的图片URL:', imageUrl);

    if (!imageUrl) {
      return NextResponse.json(
        { error: '未收到图片URL' },
        { status: 500 }
      );
    }

    // 保存图片
    let publicUrl: string;
    let storagePath: string | null = null;
    
    if (isGuest) {
      // 游客模式：也需要保存到存储（解决CORS问题）
      console.log('游客模式 - 保存图片到guest文件夹');
      // 使用特殊的guest ID
      const guestId = `guest_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const saveResult = await saveImageToStorage(imageUrl, guestId);
      publicUrl = saveResult.publicUrl;
      storagePath = saveResult.storagePath;
      console.log('游客模式 - 保存成功，公开URL:', publicUrl);
      
      // 标记游客已使用试用
      const guestFingerprint = generateGuestFingerprint(request);
      await markGuestTrialUsed(guestFingerprint, publicUrl, sanitizedPrompt, style);
    } else {
      // 注册用户：保存到存储
      const saveResult = await saveImageToStorage(imageUrl, userId);
      publicUrl = saveResult.publicUrl;
      storagePath = saveResult.storagePath;

      // 扣除积分
      const deductResult = await deductCredits(userId, 10);
      if (!deductResult.success) {
        // 如果扣除积分失败，删除已上传的图片
        await supabaseServer
          .storage
          .from('generated-images')
          .remove([storagePath]);
        return NextResponse.json(
          { error: '扣除积分失败', details: deductResult.error },
          { status: 500 }
        );
      }

      // 保存生成记录
      const { error: historyError } = await supabaseServer
        .from('generation_history')
        .insert([
          {
            user_id: userId,
            prompt: sanitizedPrompt,
            image_url: publicUrl,
            storage_path: storagePath,
            parameters: {
              style,
              model,
              size: '1024x1024',
              quality: 'standard'
            }
          }
        ]);

      if (historyError) {
        console.error('保存历史记录失败:', historyError);
        // 这里我们不返回错误，因为图片已经生成成功
      }
    }

    // 添加速率限制头部
    console.log('准备返回成功响应，图片URL:', publicUrl);
    const response = NextResponse.json({ imageUrl: publicUrl });
    response.headers.set('X-RateLimit-Limit', '5'); // 每分钟5次
    response.headers.set('X-RateLimit-Remaining', rateLimitResult.remaining.toString());
    response.headers.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString());
    
    return response;
  } catch (error) {
    console.error('生成图片时发生错误:', error);
    
    // 记录错误事件 (不重新读取request body)
    logSecurityEvent({
      type: 'suspicious_activity',
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
      details: { error: error instanceof Error ? error.message : 'unknown_error' }
    });
    
    // 处理不同类型的错误
    if (error instanceof Error) {
      // NSFW 内容错误
      if (error.message.includes('NSFW content')) {
        return NextResponse.json(
          { 
            error: '生成的内容被检测为不适合的内容，请尝试使用不同的描述或更温和的词汇',
            details: 'NSFW content detected',
            code: 'NSFW_DETECTED'
          },
          { status: 400 }
        );
      }
      
      // Replicate API错误
      if (error.message.includes('502') || error.message.includes('Bad Gateway')) {
        return NextResponse.json(
          {
            error: 'AI图片生成服务暂时不可用，请稍后再试',
            details: 'Service temporarily unavailable',
            code: 'SERVICE_UNAVAILABLE'
          },
          { status: 503 }
        );
      }
      
      // 网络超时错误
      if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
        return NextResponse.json(
          {
            error: '图片生成超时，请重试',
            details: 'Request timeout',
            code: 'TIMEOUT'
          },
          { status: 408 }
        );
      }
    }
    
    return NextResponse.json(
      { 
        error: '生成图片时发生错误，请稍后重试',
        code: 'UNKNOWN_ERROR'
      },
      { status: 500 }
    );
  }
}

// Remove the generateImage function as it shouldn't be in the API route file
// This function should be in a client-side file instead

 