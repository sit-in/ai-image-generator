import { NextResponse } from 'next/server';
import { NewApiService } from '@/lib/newApiService';

export async function POST(req: Request) {
  try {
    // 检查 API 密钥
    if (!process.env.NEW_API_KEY) {
      console.error('NEW_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      );
    }

    const { prompt } = await req.json();

    if (!prompt) {
      return NextResponse.json(
        { error: '请提供图片描述' },
        { status: 400 }
      );
    }

    console.log('Received prompt:', prompt);

    const apiService = NewApiService.getInstance();
    const result = await apiService.generateImage(prompt, {
      model: 'dall-e-2',
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

    return NextResponse.json({ imageUrl });
  } catch (error) {
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