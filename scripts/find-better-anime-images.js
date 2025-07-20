const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findBetterAnimeImages() {
  console.log('查找更好的动漫风格图片...\n');

  try {
    // 获取所有动漫风格的图片
    const { data: animeImages, error } = await supabase
      .from('generation_history')
      .select('*')
      .eq('parameters->>style', 'anime')
      .not('image_url', 'is', null)
      .like('image_url', '%supabase.co%')
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('查询错误:', error);
      return;
    }

    console.log(`找到 ${animeImages.length} 张动漫风格图片\n`);

    // 过滤并显示更适合展示的图片
    const goodImages = animeImages.filter(img => {
      const prompt = img.prompt.toLowerCase();
      // 过滤掉可能不太合适的内容
      return !prompt.includes('sexy') && 
             !prompt.includes('handsome boy') &&
             prompt.length > 5;
    });

    console.log('推荐的动漫风格图片：\n');
    goodImages.slice(0, 10).forEach((img, index) => {
      console.log(`${index + 1}. ID: ${img.id}`);
      console.log(`   Prompt: ${img.prompt}`);
      console.log(`   URL: ${img.image_url}`);
      console.log(`   创建时间: ${new Date(img.created_at).toLocaleString('zh-CN')}`);
      console.log('---');
    });

    // 特别推荐一些典型的动漫风格prompt
    console.log('\n特别推荐（根据prompt质量）：');
    const recommended = goodImages.filter(img => {
      const prompt = img.prompt.toLowerCase();
      return prompt.includes('女') || 
             prompt.includes('少女') || 
             prompt.includes('公主') ||
             prompt.includes('魔法') ||
             prompt.includes('动漫') ||
             prompt.includes('樱花') ||
             prompt.includes('日本');
    });

    recommended.slice(0, 3).forEach((img, index) => {
      console.log(`\n推荐 ${index + 1}:`);
      console.log(`ID: ${img.id}`);
      console.log(`Prompt: ${img.prompt}`);
      console.log(`URL: ${img.image_url}`);
    });

  } catch (error) {
    console.error('脚本执行错误:', error);
  }
}

findBetterAnimeImages();