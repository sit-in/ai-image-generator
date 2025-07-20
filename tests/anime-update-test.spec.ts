import { test, expect } from '@playwright/test';

test.describe('动漫风格图片更新测试', () => {
  test('验证动漫图片已更新为smart girl', async ({ page, request }) => {
    // 1. 通过API验证
    const response = await request.get('http://localhost:3000/api/gallery-examples');
    const data = await response.json();
    
    expect(response.ok()).toBeTruthy();
    
    const animeImages = data.examples.filter(ex => ex.style === '动漫');
    console.log(`\nAPI返回 ${animeImages.length} 张动漫风格图片：`);
    
    // 验证包含 smart girl
    const hasSmartGirl = animeImages.some(img => 
      img.prompt.toLowerCase() === 'smart girl'
    );
    expect(hasSmartGirl).toBeTruthy();
    console.log('✅ 包含 "smart girl" 图片');
    
    // 验证不包含不合适的图片
    const hasInappropriate = animeImages.some(img => {
      const prompt = img.prompt.toLowerCase();
      return prompt === 'handsome boy' || 
             prompt === '公主' || 
             prompt.includes('sexy');
    });
    expect(hasInappropriate).toBeFalsy();
    console.log('✅ 已过滤掉不合适的图片');
    
    // 打印当前动漫图片
    animeImages.forEach((img, index) => {
      console.log(`${index + 1}. "${img.prompt}"`);
    });
    
    // 2. 页面测试
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 查找所有动漫风格的卡片
    const animeCards = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 > div').filter({
      has: page.locator('span:has-text("动漫")')
    });
    
    const cardCount = await animeCards.count();
    console.log(`\n页面显示 ${cardCount} 张动漫风格图片`);
    
    // 验证第一张动漫图片是 smart girl
    if (cardCount > 0) {
      const firstCard = animeCards.first();
      await firstCard.hover();
      await page.waitForTimeout(500);
      
      const promptText = await firstCard.locator('p.text-white').textContent();
      console.log(`第一张动漫图片的prompt: "${promptText}"`);
      expect(promptText?.toLowerCase()).toBe('smart girl');
    }
    
    // 3. 截图验证
    await page.screenshot({ 
      path: 'tests/screenshots/anime-updated-smart-girl.png',
      fullPage: true 
    });
    
    // 截图动漫卡片区域
    if (cardCount > 0) {
      const firstAnimeCard = animeCards.first();
      await firstAnimeCard.screenshot({
        path: 'tests/screenshots/smart-girl-card.png'
      });
    }
    
    console.log('\n✅ 动漫风格图片已成功更新为 smart girl');
  });
  
  test('完整画廊测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(3000);
    
    // 检查所有图片加载
    const allImages = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 img');
    const imageCount = await allImages.count();
    
    expect(imageCount).toBe(8);
    console.log(`\n✅ 画廊显示了 ${imageCount} 张图片`);
    
    // 检查所有图片都是Supabase URL
    let supabaseCount = 0;
    for (let i = 0; i < imageCount; i++) {
      const src = await allImages.nth(i).getAttribute('src');
      if (src?.includes('supabase.co')) {
        supabaseCount++;
      }
    }
    
    expect(supabaseCount).toBe(8);
    console.log(`✅ 所有 ${supabaseCount} 张图片都来自 Supabase`);
    
    // 验证6种风格都存在
    const styles = ['自然', '动漫', '油画', '水彩', '像素', '吉卜力'];
    for (const style of styles) {
      const count = await page.locator(`span:has-text("${style}")`).count();
      expect(count).toBeGreaterThan(0);
    }
    console.log('✅ 所有6种风格都有展示');
    
    // 测试点击功能
    const firstCard = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 > div').first();
    await firstCard.hover();
    await page.waitForTimeout(500);
    
    const promptText = await firstCard.locator('p.text-white').textContent();
    const reuseButton = firstCard.locator('button:has-text("立即复用")');
    await reuseButton.click();
    
    await page.waitForURL(/\?prompt=/);
    const url = new URL(page.url());
    const promptParam = url.searchParams.get('prompt');
    
    expect(promptParam).toBe(promptText?.trim());
    console.log('✅ 点击复用功能正常');
    
    console.log('\n🎉 所有测试通过！画廊功能完整，动漫图片已更新');
  });
});