import { NextResponse } from 'next/server';
import { NewApiService } from '@/lib/newApiService';
import { supabaseServer } from '@/lib/supabase-server';

async function fetchWithRetry(url: string | URL, options: RequestInit, retries = 3): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'Accept': 'application/json',
          'Connection': 'keep-alive'
        }
      });
      return response;
    } catch (error) {
      if (i === retries - 1) throw error;
      console.log(`Retry attempt ${i + 1} of ${retries}`);
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('All retry attempts failed');
}

export async function POST(req: Request) {
  let userId: string | undefined = undefined;
  let creditData: any = undefined;
  try {
    // 检查 API 密钥
    if (!process.env.NEW_API_KEY) {
      console.error('NEW_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      );
    }

    const body = await req.json();
    const prompt = body.prompt;
    userId = body.userId;

    if (!prompt) {
      return NextResponse.json(
        { error: '请提供图片描述' },
        { status: 400 }
      );
    }
    if (!userId) {
      return NextResponse.json(
        { error: '缺少用户ID' },
        { status: 400 }
      );
    }

    // 校验积分
    const creditRes = await supabaseServer
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();
    creditData = creditRes.data;
    const creditError = creditRes.error;
    if (creditError || !creditData) {
      return NextResponse.json(
        { error: '无法获取用户积分' },
        { status: 400 }
      );
    }
    if (creditData.credits < 10) {
      return NextResponse.json(
        { error: '积分不足，无法生成图片' },
        { status: 403 }
      );
    }

    // 先扣除积分
    const { data: updateData, error: updateError } = await supabaseServer
      .from('user_credits')
      .update({ credits: creditData.credits - 10 })
      .eq('user_id', userId)
      .select()
      .single();
    if (updateError) {
      return NextResponse.json(
        { error: '扣除积分失败' },
        { status: 500 }
      );
    }
    // 记录积分历史
    await supabaseServer
      .from('credit_history')
      .insert({
        user_id: userId,
        amount: -10,
        description: '图片生成消耗积分'
      });

    console.log('Received prompt:', prompt);

    const apiService = NewApiService.getInstance();
    const result = await apiService.generateImage(prompt, {
      size: '1024x1024',
      quality: 'standard',
      style: 'natural'
    });

    console.log('API Response:', result);

    // 假设 New API 返回的数据格式为 { data: [{ url: string }] }
    const imageUrl = result.data?.[0]?.url;

    if (!imageUrl) {
      console.error('No image URL in response:', result);
      throw new Error('未收到图片URL');
    }

    // 保存生成历史
    const { error: historyError } = await supabaseServer
      .from('generation_history')
      .insert({
        user_id: userId,
        prompt: prompt,
        image_url: imageUrl,
        parameters: {
          size: '1024x1024',
          quality: 'standard',
          style: 'natural'
        }
      });

    if (historyError) {
      console.error('保存生成历史失败:', historyError);
      // 这里我们不返回错误，因为图片生成是成功的
    }

    return NextResponse.json({ imageUrl });
  } catch (error) {
    // 补偿积分（回滚）
    if (typeof userId !== 'undefined' && typeof creditData !== 'undefined') {
      await supabaseServer
        .from('user_credits')
        .update({ credits: creditData.credits })
        .eq('user_id', userId);
      await supabaseServer
        .from('credit_history')
        .insert({
          user_id: userId,
          amount: 10,
          description: '图片生成失败积分回滚'
        });
    }
    console.error('Error generating image:', error);
    return NextResponse.json(
      { 
        error: '生成图片失败',
        details: error instanceof Error ? error.message : '未知错误'
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