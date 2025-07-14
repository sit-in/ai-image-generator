import { supabaseServer } from './supabase-server';

export async function checkCredits(userId: string): Promise<number | undefined> {
  try {
    const { data, error } = await supabaseServer
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (error) {
      console.error('获取积分失败:', error);
      return undefined;
    }

    return data.credits;
  } catch (error) {
    console.error('检查积分时发生错误:', error);
    return undefined;
  }
}

export async function deductCredits(userId: string, amount: number): Promise<{ success: boolean; error?: any }> {
  try {
    // 开始事务
    const { data: creditData, error: creditError } = await supabaseServer
      .from('user_credits')
      .select('credits')
      .eq('user_id', userId)
      .single();

    if (creditError || !creditData) {
      return { success: false, error: creditError || '未找到用户积分记录' };
    }

    if (creditData.credits < amount) {
      return { success: false, error: '积分不足' };
    }

    // 扣除积分
    const { error: updateError } = await supabaseServer
      .from('user_credits')
      .update({ credits: creditData.credits - amount })
      .eq('user_id', userId);

    if (updateError) {
      return { success: false, error: updateError };
    }

    // 记录积分历史
    const { error: historyError } = await supabaseServer
      .from('credit_history')
      .insert({
        user_id: userId,
        amount: -amount,
        description: '图片生成消耗积分'
      });

    if (historyError) {
      console.error('记录积分历史失败:', historyError);
      // 这里我们不返回错误，因为积分已经扣除成功
    }

    return { success: true };
  } catch (error) {
    console.error('扣除积分时发生错误:', error);
    return { success: false, error };
  }
} 