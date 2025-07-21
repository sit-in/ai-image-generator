import { NextResponse } from 'next/server';
import { supabaseServer } from '@/lib/supabase-server';

export async function POST(request: Request) {
  try {
    const { action = 'scan' } = await request.json();
    
    // 验证管理员权限
    const { data: { session } } = await supabaseServer.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    // 检查管理员权限
    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: '无管理员权限' }, { status: 403 });
    }

    // 获取所有生成历史记录
    const { data: history, error: historyError } = await supabaseServer
      .from('generation_history')
      .select('id, image_url, storage_path, created_at, user_id')
      .order('created_at', { ascending: false });

    if (historyError) {
      console.error('获取历史记录失败:', historyError);
      return NextResponse.json({ error: '获取历史记录失败' }, { status: 500 });
    }

    const invalidRecords = [];
    const validRecords = [];
    
    // 检查每个图片链接的有效性
    for (const record of history) {
      try {
        // 检查图片URL是否可访问
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const response = await fetch(record.image_url, { 
          method: 'HEAD',
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (response.ok) {
          validRecords.push(record);
        } else {
          invalidRecords.push({
            ...record,
            error: `HTTP ${response.status}: ${response.statusText}`
          });
        }
      } catch (error) {
        // 网络错误或超时
        invalidRecords.push({
          ...record,
          error: error instanceof Error ? error.message : '网络错误'
        });
      }
    }

    if (action === 'scan') {
      // 只扫描，不删除
      return NextResponse.json({
        success: true,
        summary: {
          total: history.length,
          valid: validRecords.length,
          invalid: invalidRecords.length
        },
        invalidRecords: invalidRecords.map(record => ({
          id: record.id,
          created_at: record.created_at,
          image_url: record.image_url,
          error: record.error
        }))
      });
    } else if (action === 'cleanup') {
      // 执行清理
      const deletedIds = [];
      
      for (const record of invalidRecords) {
        try {
          // 从数据库删除记录
          const { error: deleteError } = await supabaseServer
            .from('generation_history')
            .delete()
            .eq('id', record.id);

          if (deleteError) {
            console.error(`删除记录 ${record.id} 失败:`, deleteError);
            continue;
          }

          // 如果有storage_path，尝试从存储中删除文件
          if (record.storage_path) {
            try {
              await supabaseServer
                .storage
                .from('generated-images')
                .remove([record.storage_path]);
            } catch (storageError) {
              console.warn(`删除存储文件失败 ${record.storage_path}:`, storageError);
              // 存储文件删除失败不阻止记录删除
            }
          }

          deletedIds.push(record.id);
        } catch (error) {
          console.error(`清理记录 ${record.id} 失败:`, error);
        }
      }

      return NextResponse.json({
        success: true,
        summary: {
          total: history.length,
          invalid: invalidRecords.length,
          deleted: deletedIds.length,
          remaining: history.length - deletedIds.length
        },
        deletedIds
      });
    } else {
      return NextResponse.json({ error: '无效的操作类型' }, { status: 400 });
    }

  } catch (error) {
    console.error('清理图片失败:', error);
    return NextResponse.json(
      { error: '清理图片时发生错误', details: error },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // 验证管理员权限
    const { data: { session } } = await supabaseServer.auth.getSession();
    if (!session) {
      return NextResponse.json({ error: '请先登录' }, { status: 401 });
    }

    const { data: profile } = await supabaseServer
      .from('profiles')
      .select('is_admin')
      .eq('id', session.user.id)
      .single();

    if (!profile?.is_admin) {
      return NextResponse.json({ error: '无管理员权限' }, { status: 403 });
    }

    // 获取统计信息
    const { data: totalHistory, error } = await supabaseServer
      .from('generation_history')
      .select('id', { count: 'exact' });

    if (error) {
      return NextResponse.json({ error: '获取统计信息失败' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      stats: {
        totalRecords: totalHistory?.length || 0
      }
    });

  } catch (error) {
    console.error('获取清理统计失败:', error);
    return NextResponse.json(
      { error: '获取统计信息时发生错误' },
      { status: 500 }
    );
  }
}