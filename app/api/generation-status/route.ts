import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

// 模拟生成进度的存储（在生产环境中应该使用Redis或数据库）
const generationProgress = new Map<string, {
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  queuePosition?: number;
  imageUrl?: string;
  error?: string;
  createdAt: number;
}>();

// 清理过期的进度数据（超过5分钟）
setInterval(() => {
  const now = Date.now();
  for (const [id, data] of generationProgress.entries()) {
    if (now - data.createdAt > 5 * 60 * 1000) {
      generationProgress.delete(id);
    }
  }
}, 60 * 1000);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const generationId = searchParams.get('id');

  if (!generationId) {
    return NextResponse.json(
      { error: '缺少生成ID' },
      { status: 400 }
    );
  }

  const progress = generationProgress.get(generationId);
  
  if (!progress) {
    return NextResponse.json(
      { error: '找不到该生成任务' },
      { status: 404 }
    );
  }

  return NextResponse.json(progress);
}

export async function POST(request: Request) {
  const body = await request.json();
  const { generationId, status, progress, queuePosition, imageUrl, error } = body;

  if (!generationId) {
    return NextResponse.json(
      { error: '缺少生成ID' },
      { status: 400 }
    );
  }

  // 更新进度
  generationProgress.set(generationId, {
    status: status || 'pending',
    progress: progress || 0,
    queuePosition,
    imageUrl,
    error,
    createdAt: generationProgress.get(generationId)?.createdAt || Date.now()
  });

  return NextResponse.json({ success: true });
}

// 用于SSE的端点
export async function* streamGenerationStatus(generationId: string) {
  while (true) {
    const progress = generationProgress.get(generationId);
    
    if (!progress) {
      yield `data: ${JSON.stringify({ error: '任务不存在' })}\n\n`;
      break;
    }

    yield `data: ${JSON.stringify(progress)}\n\n`;

    if (progress.status === 'completed' || progress.status === 'failed') {
      break;
    }

    // 每秒更新一次
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
}