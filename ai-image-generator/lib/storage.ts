import { supabaseServer } from './supabase-server';

export async function saveImageToStorage(imageUrl: string, userId: string) {
  try {
    // 1. 从 DALL-E 获取图片数据
    const response = await fetch(imageUrl);
    const imageBlob = await response.blob();
    
    // 2. 生成唯一的文件名
    const fileName = `${userId}/${Date.now()}.png`;
    
    // 3. 上传到 Supabase Storage
    const { data, error } = await supabaseServer
      .storage
      .from('generated-images')
      .upload(fileName, imageBlob, {
        contentType: 'image/png',
        cacheControl: '3600',
        upsert: false
      });
      
    if (error) throw error;
    
    // 4. 获取公开访问的 URL
    const { data: { publicUrl } } = supabaseServer
      .storage
      .from('generated-images')
      .getPublicUrl(fileName);
      
    return {
      publicUrl,
      storagePath: fileName
    };
  } catch (error) {
    console.error('保存图片失败:', error);
    throw error;
  }
}

export async function deleteImageFromStorage(storagePath: string) {
  try {
    const { error } = await supabaseServer
      .storage
      .from('generated-images')
      .remove([storagePath]);
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('删除图片失败:', error);
    throw error;
  }
} 