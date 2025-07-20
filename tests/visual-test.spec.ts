import { test, expect } from '@playwright/test';

test.describe('视觉测试 - 截图展示', () => {
  test('首页完整截图', async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 等待动画完成
    await page.waitForTimeout(1000);
    
    // 截取完整页面
    await page.screenshot({ 
      path: 'tests/screenshots/homepage-full.png',
      fullPage: true 
    });
    
    console.log('✅ 已保存首页完整截图: tests/screenshots/homepage-full.png');
  });

  test('内联生成器功能演示', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 1. 初始状态截图
    await page.screenshot({ 
      path: 'tests/screenshots/generator-initial.png',
      clip: { x: 0, y: 200, width: 1280, height: 600 }
    });
    
    // 2. 选择动漫风格
    const animeButton = page.locator('button').filter({ hasText: '动漫' });
    await animeButton.click();
    await page.waitForTimeout(300);
    
    // 3. 输入提示词
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    await input.fill('夕阳下的富士山，樱花飘落');
    
    // 输入后截图
    await page.screenshot({ 
      path: 'tests/screenshots/generator-with-input.png',
      clip: { x: 0, y: 200, width: 1280, height: 600 }
    });
    
    console.log('✅ 已保存内联生成器截图');
  });

  test('移动端视图', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 812 }); // iPhone X
    
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
    
    // 移动端截图
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-view.png',
      fullPage: true 
    });
    
    console.log('✅ 已保存移动端视图截图: tests/screenshots/mobile-view.png');
  });

  test('作品展示区域', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 滚动到作品展示区域
    await page.locator('text=作品展示').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // 悬停在第一个作品上
    const firstImage = page.locator('img[alt*="樱花"]').first();
    await firstImage.hover();
    await page.waitForTimeout(300);
    
    // 截取作品展示区域
    const gallerySection = page.locator('text=作品展示').locator('..');
    await gallerySection.screenshot({ 
      path: 'tests/screenshots/gallery-hover.png' 
    });
    
    console.log('✅ 已保存作品展示截图: tests/screenshots/gallery-hover.png');
  });
});