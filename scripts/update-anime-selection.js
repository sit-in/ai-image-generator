const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updateAnimeSelection() {
  console.log('分析当前动漫风格图片选择...\n');

  try {
    // 获取所有动漫风格的图片，包括可能被标记为其他风格但实际是动漫的
    const { data: allImages, error } = await supabase
      .from('generation_history')
      .select('*')
      .not('image_url', 'is', null)
      .like('image_url', '%supabase.co%')
      .or('parameters->>style.eq.anime,prompt.ilike.%动漫%,prompt.ilike.%anime%,prompt.ilike.%少女%,prompt.ilike.%公主%')
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      console.error('查询错误:', error);
      return;
    }

    console.log(`找到 ${allImages.length} 张相关图片\n`);

    // 筛选出真正的动漫风格图片
    const animeStyleImages = allImages.filter(img => {
      const style = img.parameters?.style;
      const prompt = img.prompt.toLowerCase();
      
      // 优先选择明确标记为anime风格的
      if (style === 'anime') {
        // 但排除不太合适的
        return !prompt.includes('handsome boy') && !prompt.includes('sexy');
      }
      
      // 或者prompt中包含动漫相关关键词的
      return prompt.includes('动漫') || 
             prompt.includes('少女') || 
             prompt.includes('公主') ||
             prompt.includes('魔法') ||
             prompt.includes('樱花');
    });

    console.log(`筛选后找到 ${animeStyleImages.length} 张合适的动漫风格图片\n`);

    console.log('当前正在使用的动漫图片：');
    console.log('1. "handsome boy" - 可能不太符合典型动漫风格');
    console.log('2. "公主" - 这个还可以\n');

    console.log('推荐替换为以下图片之一：\n');
    
    animeStyleImages.slice(0, 5).forEach((img, index) => {
      console.log(`选项 ${index + 1}:`);
      console.log(`  ID: ${img.id}`);
      console.log(`  Prompt: ${img.prompt}`);
      console.log(`  Style: ${img.parameters?.style}`);
      console.log(`  URL: ${img.image_url}`);
      console.log(`  创建时间: ${new Date(img.created_at).toLocaleString('zh-CN')}`);
      console.log('---');
    });

    // 如果找到了更好的，推荐最佳选择
    if (animeStyleImages.length > 0) {
      const bestChoice = animeStyleImages.find(img => 
        img.parameters?.style === 'anime' && 
        (img.prompt.includes('女') || img.prompt.includes('girl'))
      ) || animeStyleImages[0];

      console.log('\n🌟 最佳推荐：');
      console.log(`ID: ${bestChoice.id}`);
      console.log(`Prompt: ${bestChoice.prompt}`);
      console.log(`URL: ${bestChoice.image_url}`);
      
      return bestChoice;
    }

  } catch (error) {
    console.error('脚本执行错误:', error);
  }
}

updateAnimeSelection();