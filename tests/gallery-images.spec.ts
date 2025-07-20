import { test, expect } from '@playwright/test';

test.describe('作品展示图片测试', () => {
  test('验证所有作品图片正常加载', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 等待作品展示区域
    await page.waitForSelector('text=作品展示');
    
    // 获取所有作品图片
    const images = page.locator('img[alt*="樱花"], img[alt*="城市"], img[alt*="向日葵"], img[alt*="威尼斯"], img[alt*="像素"], img[alt*="吉卜力"], img[alt*="北极光"], img[alt*="蒸汽朋克"]');
    
    // 确认有 8 张图片
    await expect(images).toHaveCount(8);
    
    // 检查每张图片是否加载成功
    const imageElements = await images.all();
    for (let i = 0; i < imageElements.length; i++) {
      const img = imageElements[i];
      
      // 获取图片的 src
      const src = await img.getAttribute('src');
      console.log(`图片 ${i + 1}: ${src}`);
      
      // 检查图片是否可见
      await expect(img).toBeVisible();
      
      // 检查图片是否有正确的尺寸（不是 0x0）
      const box = await img.boundingBox();
      expect(box?.width).toBeGreaterThan(0);
      expect(box?.height).toBeGreaterThan(0);
    }
    
    console.log('✅ 所有作品图片加载正常');
  });

  test('测试作品悬停效果', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 找到第一个作品
    const firstWork = page.locator('[class*="gallery"] > div').first();
    
    // 悬停前，"立即复用"按钮应该不可见
    const reuseButton = firstWork.locator('button:has-text("立即复用")');
    await expect(reuseButton).not.toBeVisible();
    
    // 悬停
    await firstWork.hover();
    
    // 悬停后，"立即复用"按钮应该可见
    await expect(reuseButton).toBeVisible();
    
    // 检查提示词文本是否显示
    const promptText = firstWork.locator('p.text-white');
    await expect(promptText).toBeVisible();
    
    console.log('✅ 作品悬停效果正常');
  });

  test('验证图片点击跳转功能', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 找到第一个作品并悬停
    const firstWork = page.locator('[class*="gallery"] > div').first();
    await firstWork.hover();
    
    // 点击"立即复用"按钮
    const reuseButton = firstWork.locator('button:has-text("立即复用")');
    await reuseButton.click();
    
    // 验证 URL 包含 prompt 参数
    await expect(page).toHaveURL(/\?prompt=/);
    
    // 验证 prompt 参数包含预期的文本
    const url = new URL(page.url());
    const prompt = url.searchParams.get('prompt');
    expect(prompt).toContain('樱花');
    
    console.log('✅ 图片点击跳转功能正常');
  });

  test('截图展示修复后的作品展示', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 滚动到作品展示区域
    await page.locator('text=作品展示').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // 截图
    await page.screenshot({ 
      path: 'tests/screenshots/gallery-fixed.png',
      fullPage: false,
      clip: { x: 0, y: 600, width: 1280, height: 800 }
    });
    
    console.log('✅ 已保存修复后的作品展示截图');
  });
});