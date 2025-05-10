import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 检查 API 密钥
    if (!process.env.OPENROUTER_API_KEY) {
      console.error('OPENROUTER_API_KEY is not set');
      return NextResponse.json(
        { error: 'API key is not configured' },
        { status: 500 }
      );
    }

    const { prompt } = await req.json();
    console.log('Received prompt:', prompt);

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    console.log('Calling OpenRouter API...');
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
        'X-Title': 'AI Image Generator'
      },
      body: JSON.stringify({
        model: "anthropic/claude-3-opus-20240229",  // 使用支持图像生成的模型
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Generate a detailed image description for: ${prompt}. The description should be vivid and detailed enough to create an image.`
              }
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    // 记录响应状态和头信息
    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    // 获取响应文本
    const responseText = await response.text();
    console.log('Raw response:', responseText);

    if (!response.ok) {
      try {
        const errorData = JSON.parse(responseText);
        console.error('API Error:', errorData);
        throw new Error(errorData.error?.message || 'Failed to generate image');
      } catch (parseError) {
        console.error('Parse Error:', parseError);
        throw new Error(`API error: ${response.status} - ${responseText}`);
      }
    }

    // 尝试解析 JSON
    let data;
    try {
      data = JSON.parse(responseText);
      console.log('Parsed response:', data);
    } catch (parseError) {
      console.error('Failed to parse response as JSON:', parseError);
      throw new Error('Invalid response from API');
    }
    
    if (!data.choices?.[0]?.message?.content) {
      console.error('Unexpected response structure:', data);
      throw new Error('No content in response');
    }

    // 将文本描述转换为 base64 图片数据
    const imageDescription = data.choices[0].message.content;
    const imageData = `data:image/png;base64,${Buffer.from(imageDescription).toString('base64')}`;

    return NextResponse.json({ 
      imageUrl: imageData
    });
  } catch (error: any) {
    console.error('Detailed error:', {
      message: error.message,
      stack: error.stack
    });

    return NextResponse.json(
      { 
        error: error.message || 'Failed to process request',
        details: error
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