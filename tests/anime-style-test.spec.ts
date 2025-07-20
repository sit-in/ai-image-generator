import { test, expect } from '@playwright/test';

test.describe('动漫风格图片测试', () => {
  test('检查动漫风格图片是否合适', async ({ page, request }) => {
    // 首先通过API检查
    const response = await request.get('http://localhost:3000/api/gallery-examples');
    const data = await response.json();
    
    expect(response.ok()).toBeTruthy();
    
    // 找出所有动漫风格的图片
    const animeImages = data.examples.filter(ex => ex.style === '动漫');
    console.log(`找到 ${animeImages.length} 张动漫风格图片`);
    
    // 检查是否没有 "handsome boy"
    const hasHandsomeBoy = animeImages.some(img => 
      img.prompt.toLowerCase() === 'handsome boy'
    );
    expect(hasHandsomeBoy).toBeFalsy();
    console.log('✅ 已过滤掉 "handsome boy"');
    
    // 打印当前的动漫图片信息
    console.log('\n当前展示的动漫图片：');
    animeImages.forEach((img, index) => {
      console.log(`${index + 1}. Prompt: "${img.prompt}"`);
      console.log(`   URL: ${img.imageUrl}`);
    });
    
    // 检查页面显示
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000); // 等待动态加载
    
    // 查找所有动漫风格的卡片
    const animeCards = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 > div').filter({
      has: page.locator('span:has-text("动漫")')
    });
    
    const animeCount = await animeCards.count();
    console.log(`\n页面上显示了 ${animeCount} 张动漫风格图片`);
    
    // 检查每张动漫图片的prompt
    for (let i = 0; i < animeCount; i++) {
      const card = animeCards.nth(i);
      await card.hover();
      await page.waitForTimeout(500);
      
      const promptText = await card.locator('p.text-white').textContent();
      console.log(`动漫图片 ${i + 1} 的 prompt: "${promptText}"`);
      
      // 确保不是 "handsome boy"
      expect(promptText?.toLowerCase()).not.toBe('handsome boy');
    }
    
    // 截图对比
    await page.screenshot({ 
      path: 'tests/screenshots/anime-style-updated.png',
      fullPage: true 
    });
    
    // 特别截图动漫风格的卡片
    if (animeCount > 0) {
      const firstAnimeCard = animeCards.first();
      await firstAnimeCard.screenshot({
        path: 'tests/screenshots/anime-card-example.png'
      });
    }
    
    console.log('\n✅ 动漫风格图片已更新为更合适的选择');
  });
  
  test('测试所有风格的分布', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 统计每种风格的数量
    const styles = ['自然', '动漫', '油画', '水彩', '像素', '吉卜力'];
    const styleCounts = {};
    
    for (const style of styles) {
      const count = await page.locator(`span:has-text("${style}")`).count();
      styleCounts[style] = count;
    }
    
    console.log('\n风格分布统计：');
    Object.entries(styleCounts).forEach(([style, count]) => {
      console.log(`  ${style}: ${count} 张`);
    });
    
    // 确保每种风格至少有一张
    for (const style of styles) {
      expect(styleCounts[style]).toBeGreaterThan(0);
    }
    
    console.log('\n✅ 所有6种风格都有展示');
  });
});