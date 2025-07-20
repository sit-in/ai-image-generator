const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAnimeOrder() {
  console.log('检查动漫风格图片的排序...\n');

  try {
    // 获取前10张动漫风格的图片
    const { data: animeImages, error } = await supabase
      .from('generation_history')
      .select('*')
      .eq('parameters->>style', 'anime')
      .not('image_url', 'is', null)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('查询错误:', error);
      return;
    }

    console.log('按创建时间排序的前10张动漫图片：\n');
    animeImages.forEach((img, index) => {
      console.log(`${index + 1}. Prompt: "${img.prompt}"`);
      console.log(`   ID: ${img.id}`);
      console.log(`   创建时间: ${new Date(img.created_at).toLocaleString('zh-CN')}`);
      console.log(`   URL: ${img.image_url}`);
      console.log('---');
    });

    // 查找 smart girl 图片的位置
    const smartGirlIndex = animeImages.findIndex(img => img.id === '2ed6eb46-13b4-4e25-ad9b-e15be6c7f8a4');
    if (smartGirlIndex !== -1) {
      console.log(`\n"smart girl" 图片在第 ${smartGirlIndex + 1} 位`);
    } else {
      console.log('\n"smart girl" 图片不在前10张中');
    }

  } catch (error) {
    console.error('脚本执行错误:', error);
  }
}

checkAnimeOrder();