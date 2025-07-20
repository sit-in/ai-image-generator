const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('缺少环境变量');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkStyles() {
  console.log('检查数据库中的风格数据...\n');

  try {
    // 1. 获取所有独特的风格值
    const { data: allStyles, error: error1 } = await supabase
      .from('generation_history')
      .select('parameters')
      .not('parameters', 'is', null);

    if (error1) {
      console.error('查询错误:', error1);
      return;
    }

    // 提取所有风格
    const styleSet = new Set();
    allStyles.forEach(item => {
      if (item.parameters && item.parameters.style) {
        styleSet.add(item.parameters.style);
      }
    });

    console.log('数据库中存在的所有风格:');
    const sortedStyles = Array.from(styleSet).sort();
    sortedStyles.forEach(style => {
      console.log(`  - "${style}"`);
    });

    // 2. 统计每种风格的数量
    console.log('\n每种风格的图片数量:');
    for (const style of sortedStyles) {
      const { count } = await supabase
        .from('generation_history')
        .select('*', { count: 'exact', head: true })
        .eq('parameters->>style', style)
        .not('image_url', 'is', null);
      
      console.log(`  ${style}: ${count} 张`);
    }

    // 3. 特别检查吉卜力相关的记录
    console.log('\n检查吉卜力相关的记录:');
    
    // 检查包含 "ghibli" 的记录
    const { data: ghibliData1 } = await supabase
      .from('generation_history')
      .select('parameters, prompt')
      .ilike('parameters->>style', '%ghibli%')
      .limit(5);
    
    if (ghibliData1 && ghibliData1.length > 0) {
      console.log('找到包含 "ghibli" 的记录:');
      ghibliData1.forEach(item => {
        console.log(`  风格: "${item.parameters?.style}", 提示词: "${item.prompt}"`);
      });
    }

    // 检查包含 "吉卜力" 的记录
    const { data: ghibliData2 } = await supabase
      .from('generation_history')
      .select('parameters, prompt')
      .or('prompt.ilike.%吉卜力%,prompt.ilike.%ghibli%')
      .limit(5);
    
    if (ghibliData2 && ghibliData2.length > 0) {
      console.log('\n找到提示词包含 "吉卜力/ghibli" 的记录:');
      ghibliData2.forEach(item => {
        console.log(`  风格: "${item.parameters?.style}", 提示词: "${item.prompt}"`);
      });
    }

    // 4. 检查具体的风格值拼写
    console.log('\n检查可能的拼写变化:');
    const possibleGhibliStyles = ['ghibli', 'Ghibli', 'GHIBLI', 'studio_ghibli', 'studio-ghibli', '吉卜力'];
    
    for (const variant of possibleGhibliStyles) {
      const { count } = await supabase
        .from('generation_history')
        .select('*', { count: 'exact', head: true })
        .eq('parameters->>style', variant);
      
      if (count > 0) {
        console.log(`  找到 "${variant}": ${count} 条记录`);
      }
    }

  } catch (error) {
    console.error('脚本执行错误:', error);
  }
}

checkStyles();