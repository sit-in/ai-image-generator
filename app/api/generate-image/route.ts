import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { checkCredits, deductCredits } from '@/lib/credits';
import { saveImageToStorage } from '@/lib/storage';
import { rateLimiters, createRateLimitResponse } from '@/lib/rate-limiter';
import { schemas, validateInput, sanitizeInput, containsSensitiveWords, logSecurityEvent } from '@/lib/security';
import Replicate from "replicate";

export async function POST(request: Request) {
  try {
    // 速率限制检查
    const rateLimitResult = rateLimiters.imageGeneration.check(request as any);
    if (!rateLimitResult.allowed) {
      return createRateLimitResponse(
        rateLimiters.imageGeneration['config'].message || '请求过于频繁',
        rateLimitResult.resetTime
      );
    }

    const body = await request.json();
    const { prompt, userId, style = 'natural' } = body;

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

    // 内容安全检查
    const sanitizedPrompt = sanitizeInput(prompt);
    if (containsSensitiveWords(sanitizedPrompt)) {
      logSecurityEvent({
        type: 'suspicious_activity',
        userId,
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        details: { prompt: sanitizedPrompt, reason: 'sensitive_words' }
      });
      
      return NextResponse.json(
        { error: '提示词包含敏感内容，请修改后重试' },
        { status: 400 }
      );
    }

    // 检查积分
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

    // === 用 Replicate 生成图片 ===
    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // 构建精确的提示词 - 重点关注用户原始输入的准确性
    let cleanPrompt = sanitizedPrompt;
    
    // 检查是否是中文输入，如果是，可以考虑翻译或使用英文关键词
    const chinesePattern = /[\u4e00-\u9fff]/;
    const isChinese = chinesePattern.test(cleanPrompt);
    
    // 如果包含中文，保持原样，但在前面加上英文描述以提高准确性
    if (isChinese) {
      // 对常见中文词汇做简单映射
      const chineseToEnglish: { [key: string]: string } = {
        '美女': 'beautiful woman',
        '帅哥': 'handsome man', 
        '女孩': 'girl',
        '男孩': 'boy',
        '猫': 'cat',
        '狗': 'dog',
        '花': 'flower',
        '山': 'mountain',
        '海': 'ocean',
        '城市': 'city',
        '森林': 'forest'
      };
      
      // 尝试找到中文关键词的英文对应
      let englishEquivalent = '';
      for (const [chinese, english] of Object.entries(chineseToEnglish)) {
        if (cleanPrompt.includes(chinese)) {
          englishEquivalent = english;
          break;
        }
      }
      
      // 如果找到对应的英文，使用英文作为主要描述
      if (englishEquivalent) {
        cleanPrompt = `${englishEquivalent}, ${cleanPrompt}`;
      }
    }
    
    // 风格映射 - 将风格描述放在最前面
    const styleDescriptions = {
      'anime': 'anime style',
      'oil': 'oil painting style',  
      'watercolor': 'watercolor painting style',
      'pixel': 'pixel art style',
      'ghibli': 'Studio Ghibli style',
      'natural': 'realistic style'
    };
    
    const styleDesc = styleDescriptions[style as keyof typeof styleDescriptions] || styleDescriptions.natural;
    let styledPrompt = `${styleDesc}, ${cleanPrompt}, high quality`;

    // 调试日志 - 打印实际发送的提示词
    console.log('原始提示词:', prompt);
    console.log('风格:', style);
    console.log('最终提示词:', styledPrompt);

    const input = { prompt: styledPrompt };
    // Replicate 只接受 'owner/model' 或 'owner/model:version' 形式
    const model = (process.env.REPLICATE_MODEL as `${string}/${string}`) || "black-forest-labs/flux-schnell";
    const output = await replicate.run(model, { input });
    const imageUrl = Array.isArray(output) ? output[0] : output;

    if (!imageUrl) {
      return NextResponse.json(
        { error: '未收到图片URL' },
        { status: 500 }
      );
    }

    // 保存图片到 Supabase Storage
    const { publicUrl, storagePath } = await saveImageToStorage(imageUrl, userId);

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

    // 添加速率限制头部
    const response = NextResponse.json({ imageUrl: publicUrl });
    response.headers.set('X-RateLimit-Limit', rateLimiters.imageGeneration['config'].maxRequests.toString());
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

export async function generateImage(prompt: string) {
  const response = await fetch('/api/generate-image', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || '生成图片失败');
  }

  const data = await response.json();
  return { imageUrl: data.imageUrl };
}

// 添加一个获取可用模型的函数
async function getAvailableModels() {
  const response = await fetch('https://openrouter.ai/api/v1/models', {
    headers: {
      'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`
    }
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch available models');
  }
  
  return response.json();
} 