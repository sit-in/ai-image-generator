import { test, expect } from '@playwright/test';

test.describe('风格一致性测试', () => {
  test('内联生成器和作品展示的风格应该保持一致', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 获取内联生成器的风格
    const generatorStyles = await page.locator('button').filter({ 
      hasText: /^(自然|动漫|油画|水彩|像素|吉卜力)$/ 
    }).allTextContents();
    
    console.log('内联生成器风格:', generatorStyles);
    
    // 获取作品展示的风格（去重）
    const galleryStyles = await page.locator('span.text-gray-700').filter({ 
      hasText: /^(自然|动漫|油画|水彩|像素|吉卜力)$/ 
    }).allTextContents();
    
    const uniqueGalleryStyles = [...new Set(galleryStyles)];
    console.log('作品展示风格（去重）:', uniqueGalleryStyles);
    
    // 验证两者包含相同的风格
    expect(generatorStyles.sort()).toEqual(uniqueGalleryStyles.sort());
    
    console.log('✅ 风格一致性验证通过！');
  });

  test('作品展示应该展示所有6种风格', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    const expectedStyles = ['自然', '动漫', '油画', '水彩', '像素', '吉卜力'];
    
    for (const style of expectedStyles) {
      const styleElements = page.locator('span.text-gray-700').filter({ hasText: style });
      const count = await styleElements.count();
      
      console.log(`${style}风格作品数量: ${count}`);
      expect(count).toBeGreaterThan(0);
    }
    
    console.log('✅ 所有6种风格都在作品展示中出现');
  });

  test('截图展示风格一致性', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 截取内联生成器区域
    const generatorSection = page.locator('input[placeholder*="描述你想要的图片"]').locator('..');
    await generatorSection.screenshot({ 
      path: 'tests/screenshots/style-consistency-generator.png' 
    });
    
    // 滚动到作品展示区域
    await page.locator('text=作品展示').scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    // 截取作品展示区域
    await page.screenshot({ 
      path: 'tests/screenshots/style-consistency-gallery.png',
      clip: { x: 0, y: 600, width: 1280, height: 800 }
    });
    
    console.log('✅ 已保存风格一致性截图');
  });
});