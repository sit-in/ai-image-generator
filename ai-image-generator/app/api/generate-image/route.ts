import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';
import { checkCredits, deductCredits } from '@/lib/credits';
import { saveImageToStorage } from '@/lib/storage';
import Replicate from "replicate";

export async function POST(request: Request) {
  try {
    const { prompt, userId, style = 'natural' } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '提示词不能为空' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: '用户未登录' },
        { status: 401 }
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

    // 根据 style 拼接 prompt（如需更丰富风格可扩展）
    let styledPrompt = prompt;
    if (style === 'anime') styledPrompt += ', anime style, Japanese animation, vibrant colors, detailed illustration';
    else if (style === 'oil') styledPrompt += ', oil painting style, thick brushstrokes, artistic';
    else if (style === 'watercolor') styledPrompt += ', watercolor style, soft colors, edge bleeding';
    else if (style === 'pixel') styledPrompt += ', pixel art style, retro game, 8-bit';
    else if (style === 'ghibli') styledPrompt += ', Studio Ghibli style, warm, detailed, fairy tale';
    else styledPrompt += ', photorealistic, high quality, detailed';

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
          prompt,
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

    return NextResponse.json({ imageUrl: publicUrl });
  } catch (error) {
    console.error('生成图片时发生错误:', error);
    return NextResponse.json(
      { error: '生成图片时发生错误', details: error },
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