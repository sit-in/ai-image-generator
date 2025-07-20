const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testQueries() {
  console.log('测试吉卜力风格查询...\n');

  // 1. 直接查询 parameters 字段
  const { data: data1, error: error1 } = await supabase
    .from('generation_history')
    .select('id, parameters, image_url')
    .limit(5);
  
  console.log('1. 示例记录的 parameters 结构:');
  data1?.forEach(item => {
    console.log(`  ID: ${item.id}`);
    console.log(`  parameters: ${JSON.stringify(item.parameters)}`);
    console.log(`  style值: ${item.parameters?.style}`);
    console.log('---');
  });

  // 2. 测试不同的查询方式
  console.log('\n2. 测试查询 ghibli 风格:');
  
  // 方式1: 使用 ->> 操作符
  const { data: data2, count: count2 } = await supabase
    .from('generation_history')
    .select('*', { count: 'exact', head: true })
    .eq('parameters->>style', 'ghibli')
    .not('image_url', 'is', null);
  
  console.log(`  使用 parameters->>style = 'ghibli': ${count2} 条`);

  // 方式2: 使用 ilike
  const { data: data3, count: count3 } = await supabase
    .from('generation_history')
    .select('*', { count: 'exact', head: true })
    .ilike('parameters->>style', '%ghibli%')
    .not('image_url', 'is', null);
  
  console.log(`  使用 parameters->>style ilike '%ghibli%': ${count3} 条`);

  // 3. 获取实际的 ghibli 记录看看
  const { data: ghibliData } = await supabase
    .from('generation_history')
    .select('id, parameters, image_url, prompt')
    .eq('parameters->>style', 'ghibli')
    .not('image_url', 'is', null)
    .limit(3);
  
  console.log('\n3. 实际的 ghibli 记录:');
  ghibliData?.forEach(item => {
    console.log(`  ID: ${item.id}`);
    console.log(`  prompt: ${item.prompt}`);
    console.log(`  image_url: ${item.image_url}`);
    console.log(`  是否为Supabase链接: ${item.image_url?.includes('supabase.co')}`);
    console.log('---');
  });

  // 4. 检查所有风格的 Supabase 图片数量
  console.log('\n4. 各风格的 Supabase 图片数量:');
  const styles = ['natural', 'anime', 'oil', 'watercolor', 'pixel', 'ghibli'];
  
  for (const style of styles) {
    const { count } = await supabase
      .from('generation_history')
      .select('*', { count: 'exact', head: true })
      .eq('parameters->>style', style)
      .not('image_url', 'is', null)
      .like('image_url', '%supabase.co%');
    
    console.log(`  ${style}: ${count} 张 Supabase 图片`);
  }
}

testQueries().catch(console.error);