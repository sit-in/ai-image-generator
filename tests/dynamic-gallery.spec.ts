import { test, expect } from '@playwright/test';

test.describe('动态画廊测试', () => {
  test('验证画廊从数据库加载真实图片', async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:3001');
    
    // 等待画廊加载
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // 等待异步加载完成
    
    // 检查是否有图片元素
    const images = page.locator('img[alt*="AI"], img[alt*="生成"], img[alt*="作品"]');
    const imageCount = await images.count();
    console.log(`找到 ${imageCount} 张图片`);
    
    // 获取所有图片的 src
    const imageSources = await images.evaluateAll(imgs => 
      imgs.map(img => (img as HTMLImageElement).src)
    );
    
    console.log('图片来源:');
    imageSources.forEach((src, index) => {
      console.log(`  ${index + 1}. ${src}`);
    });
    
    // 检查是否有 Supabase 图片
    const supabaseImages = imageSources.filter(src => 
      src.includes('supabase.co') || src.includes('blob.core.windows.net')
    );
    
    console.log(`\n找到 ${supabaseImages.length} 张来自数据库的真实图片`);
    
    // 检查是否有 SVG 占位图
    const svgImages = imageSources.filter(src => src.endsWith('.svg'));
    console.log(`找到 ${svgImages.length} 张 SVG 占位图`);
    
    // 截图
    await page.screenshot({ 
      path: 'tests/screenshots/dynamic-gallery.png',
      fullPage: true 
    });
    
    console.log('\n✅ 动态画廊测试完成');
  });

  test('测试 API 响应', async ({ request }) => {
    const response = await request.get('http://localhost:3001/api/gallery-examples');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    console.log('API 响应:', JSON.stringify(data, null, 2));
    
    expect(data.success).toBe(true);
    expect(data.examples).toBeDefined();
    expect(Array.isArray(data.examples)).toBe(true);
    
    // 检查返回的图片
    if (data.examples.length > 0) {
      console.log('\n返回的图片示例:');
      data.examples.forEach((example: any, index: number) => {
        console.log(`${index + 1}. ${example.style}: ${example.imageUrl.substring(0, 50)}...`);
      });
    }
  });
});