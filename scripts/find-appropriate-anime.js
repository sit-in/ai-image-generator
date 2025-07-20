const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function findAppropriateAnimeImages() {
  console.log('寻找更合适的动漫风格图片...\n');

  try {
    // 当前使用的公主图片ID
    const currentPrincessId = '3a82351a-8bf6-4f0d-aa4a-2f73082e37d8';
    
    // 获取所有动漫风格的图片，扩大搜索范围
    const { data: animeImages, error } = await supabase
      .from('generation_history')
      .select('*')
      .eq('parameters->>style', 'anime')
      .not('image_url', 'is', null)
      .like('image_url', '%supabase.co%')
      .order('created_at', { ascending: false })
      .limit(30);

    if (error) {
      console.error('查询错误:', error);
      return;
    }

    console.log(`找到 ${animeImages.length} 张动漫风格图片\n`);

    // 过滤出更适合展示的图片
    const appropriateImages = animeImages.filter(img => {
      const prompt = img.prompt.toLowerCase();
      // 排除不合适的内容
      return !prompt.includes('sexy') && 
             !prompt.includes('handsome boy') &&
             !prompt.includes('big boost') &&
             img.id !== currentPrincessId && // 排除当前的公主图片
             prompt.length > 3;
    });

    console.log(`过滤后找到 ${appropriateImages.length} 张合适的图片\n`);

    // 分类显示
    console.log('=== 女性角色相关 ===');
    const femaleCharacters = appropriateImages.filter(img => {
      const prompt = img.prompt.toLowerCase();
      return prompt.includes('girl') || 
             prompt.includes('女') || 
             prompt.includes('少女') ||
             prompt.includes('woman');
    });
    
    femaleCharacters.slice(0, 5).forEach((img, index) => {
      console.log(`${index + 1}. Prompt: "${img.prompt}"`);
      console.log(`   ID: ${img.id}`);
      console.log(`   URL: ${img.image_url}`);
      console.log(`   创建时间: ${new Date(img.created_at).toLocaleString('zh-CN')}`);
      console.log('---');
    });

    console.log('\n=== 动物/其他主题 ===');
    const otherThemes = appropriateImages.filter(img => {
      const prompt = img.prompt.toLowerCase();
      return !prompt.includes('girl') && 
             !prompt.includes('女') && 
             !prompt.includes('少女') &&
             !prompt.includes('woman') &&
             !prompt.includes('公主');
    });
    
    otherThemes.slice(0, 5).forEach((img, index) => {
      console.log(`${index + 1}. Prompt: "${img.prompt}"`);
      console.log(`   ID: ${img.id}`);
      console.log(`   URL: ${img.image_url}`);
      console.log(`   创建时间: ${new Date(img.created_at).toLocaleString('zh-CN')}`);
      console.log('---');
    });

    // 推荐最佳选择
    console.log('\n🌟 推荐替换方案：');
    
    // 优先推荐 smart girl
    const smartGirl = appropriateImages.find(img => img.id === '2ed6eb46-13b4-4e25-ad9b-e15be6c7f8a4');
    if (smartGirl) {
      console.log('\n选项 1（推荐）: Smart Girl');
      console.log(`ID: ${smartGirl.id}`);
      console.log(`Prompt: ${smartGirl.prompt}`);
      console.log(`URL: ${smartGirl.image_url}`);
    }
    
    // 其他推荐
    const recommendations = appropriateImages
      .filter(img => img.id !== '2ed6eb46-13b4-4e25-ad9b-e15be6c7f8a4')
      .slice(0, 3);
    
    recommendations.forEach((img, index) => {
      console.log(`\n选项 ${smartGirl ? index + 2 : index + 1}:`);
      console.log(`ID: ${img.id}`);
      console.log(`Prompt: "${img.prompt}"`);
      console.log(`URL: ${img.image_url}`);
    });

  } catch (error) {
    console.error('脚本执行错误:', error);
  }
}

findAppropriateAnimeImages();