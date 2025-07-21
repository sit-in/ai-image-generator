import { test, expect } from '@playwright/test';

test('检查画廊渲染问题', async ({ page }) => {
  // 启用控制台日志
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('浏览器错误:', msg.text());
    }
  });

  await page.goto('http://localhost:3001');
  await page.waitForLoadState('networkidle');
  
  // 等待动态内容加载
  await page.waitForTimeout(3000);
  
  // 检查画廊容器
  const galleryContainer = await page.$('[class*="grid-cols-2"]');
  console.log('画廊容器存在:', !!galleryContainer);
  
  // 检查所有图片元素
  const allImages = await page.$$('img');
  console.log(`页面上总共有 ${allImages.length} 个 img 元素`);
  
  // 检查每个图片的详细信息
  for (let i = 0; i < allImages.length; i++) {
    const img = allImages[i];
    const src = await img.getAttribute('src');
    const alt = await img.getAttribute('alt');
    const isVisible = await img.isVisible();
    
    console.log(`\n图片 ${i + 1}:`);
    console.log(`  src: ${src}`);
    console.log(`  alt: ${alt}`);
    console.log(`  可见: ${isVisible}`);
  }
  
  // 检查是否有加载错误
  const brokenImages = await page.$$eval('img', imgs => 
    imgs.filter(img => !(img as HTMLImageElement).complete || (img as HTMLImageElement).naturalHeight === 0)
      .map(img => (img as HTMLImageElement).src)
  );
  
  if (brokenImages.length > 0) {
    console.log('\n加载失败的图片:');
    brokenImages.forEach(src => console.log(`  - ${src}`));
  }
  
  // 截图
  await page.screenshot({ 
    path: 'tests/screenshots/gallery-render-check.png',
    fullPage: true 
  });
  
  // 检查网络请求
  const imageRequests: string[] = [];
  page.on('request', request => {
    if (request.resourceType() === 'image') {
      imageRequests.push(request.url());
    }
  });
  
  // 刷新页面以捕获所有图片请求
  await page.reload();
  await page.waitForTimeout(2000);
  
  console.log('\n图片请求:');
  imageRequests.forEach(url => console.log(`  - ${url}`));
});