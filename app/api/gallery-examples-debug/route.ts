import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function GET() {
  try {
    // 专门查询吉卜力风格的图片
    const { data: ghibliData, error } = await supabaseServer
      .from('generation_history')
      .select('*')
      .eq('parameters->>style', 'ghibli')
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({ error: error.message });
    }

    // 分析结果
    const analysis = {
      totalFound: ghibliData?.length || 0,
      supabaseImages: 0,
      otherImages: 0,
      images: [] as Array<{
        id: string;
        url: string;
        prompt: string;
        isSupabase: boolean;
        createdAt: string;
      }>
    };

    if (ghibliData) {
      ghibliData.forEach(item => {
        const isSupabase = item.image_url?.includes('supabase.co');
        if (isSupabase) {
          analysis.supabaseImages++;
        } else {
          analysis.otherImages++;
        }
        
        analysis.images.push({
          id: item.id,
          url: item.image_url,
          prompt: item.prompt,
          isSupabase,
          createdAt: item.created_at
        });
      });
    }

    return NextResponse.json({
      success: true,
      analysis,
      rawData: ghibliData
    });

  } catch (error) {
    console.error('调试API错误:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}