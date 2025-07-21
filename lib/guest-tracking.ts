import { createHash } from 'crypto';
import { supabaseServer } from './supabase-server';

// 生成游客指纹
export function generateGuestFingerprint(request: Request): string {
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown';
  const userAgent = request.headers.get('user-agent') || 'unknown';
  const acceptLanguage = request.headers.get('accept-language') || 'unknown';
  
  // 创建一个相对稳定的指纹
  const fingerprint = `${ip}-${userAgent}-${acceptLanguage}`;
  return createHash('sha256').update(fingerprint).digest('hex');
}

// 检查游客试用状态
export async function checkGuestTrialStatus(fingerprint: string): Promise<{
  hasUsedTrial: boolean;
  usedAt?: Date;
}> {
  try {
    // 查询guest_trials表
    const { data, error } = await supabaseServer
      .from('guest_trials')
      .select('used_at')
      .eq('fingerprint', fingerprint)
      .single();
    
    if (error && error.code !== 'PGRST116') { // PGRST116 表示没有找到记录
      console.error('检查游客试用状态失败:', error);
      // 出错时允许试用，避免影响用户体验
      return { hasUsedTrial: false };
    }
    
    return {
      hasUsedTrial: !!data,
      usedAt: data?.used_at ? new Date(data.used_at) : undefined
    };
  } catch (error) {
    console.error('检查游客试用状态异常:', error);
    return { hasUsedTrial: false };
  }
}

// 标记游客已使用试用
export async function markGuestTrialUsed(
  fingerprint: string,
  imageUrl: string,
  prompt: string,
  style: string
): Promise<boolean> {
  try {
    const { error } = await supabaseServer
      .from('guest_trials')
      .insert({
        fingerprint,
        used_at: new Date().toISOString(),
        image_url: imageUrl,
        prompt,
        style,
        metadata: {
          timestamp: Date.now()
        }
      });
    
    if (error) {
      console.error('标记游客试用失败:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('标记游客试用异常:', error);
    return false;
  }
}

// 清理过期的游客试用记录（可选，用于定期维护）
export async function cleanupExpiredGuestTrials(daysToKeep: number = 30): Promise<number> {
  try {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() - daysToKeep);
    
    const { data, error } = await supabaseServer
      .from('guest_trials')
      .delete()
      .lt('used_at', expiryDate.toISOString())
      .select();
    
    if (error) {
      console.error('清理过期游客试用记录失败:', error);
      return 0;
    }
    
    return data?.length || 0;
  } catch (error) {
    console.error('清理过期游客试用记录异常:', error);
    return 0;
  }
}