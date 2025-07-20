import { test, expect } from '@playwright/test';

test.describe('动态画廊完整测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('画廊应该显示8张图片', async ({ page }) => {
    // 等待动态内容加载
    await page.waitForTimeout(2000);
    
    // 检查画廊容器
    const galleryContainer = page.locator('.grid.grid-cols-2.md\\:grid-cols-4');
    await expect(galleryContainer).toBeVisible();
    
    // 检查图片数量
    const images = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 img');
    await expect(images).toHaveCount(8);
    
    console.log('✅ 画廊显示了8张图片');
  });

  test('图片应该来自Supabase或本地SVG', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const images = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 img');
    const count = await images.count();
    
    let supabaseCount = 0;
    let svgCount = 0;
    let otherCount = 0;
    
    for (let i = 0; i < count; i++) {
      const src = await images.nth(i).getAttribute('src');
      if (src?.includes('supabase.co')) {
        supabaseCount++;
      } else if (src?.endsWith('.svg')) {
        svgCount++;
      } else {
        otherCount++;
      }
    }
    
    console.log(`图片来源统计：`);
    console.log(`  - Supabase: ${supabaseCount} 张`);
    console.log(`  - SVG占位图: ${svgCount} 张`);
    console.log(`  - 其他: ${otherCount} 张`);
    
    expect(supabaseCount + svgCount).toBe(8);
    console.log('✅ 所有图片来源正确');
  });

  test('每种风格都应该有展示', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    const expectedStyles = ['自然', '动漫', '油画', '水彩', '像素', '吉卜力'];
    const foundStyles = new Set<string>();
    
    // 获取所有风格标签
    const styleLabels = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 span.text-gray-700');
    const count = await styleLabels.count();
    
    for (let i = 0; i < count; i++) {
      const style = await styleLabels.nth(i).textContent();
      if (style) {
        foundStyles.add(style);
      }
    }
    
    console.log('找到的风格：', Array.from(foundStyles));
    
    // 验证所有必需的风格都存在
    for (const style of expectedStyles) {
      expect(foundStyles.has(style)).toBeTruthy();
    }
    
    console.log('✅ 所有6种风格都有展示');
  });

  test('悬停效果应该正常工作', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // 找到第一个作品卡片
    const firstCard = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 > div').first();
    
    // 初始状态下，"立即复用"按钮应该不可见
    const reuseButton = firstCard.locator('button:has-text("立即复用")');
    await expect(reuseButton).toBeHidden();
    
    // 悬停
    await firstCard.hover();
    await page.waitForTimeout(500);
    
    // 悬停后，按钮应该可见
    await expect(reuseButton).toBeVisible();
    
    // 检查提示词文本是否显示
    const promptText = firstCard.locator('p.text-white');
    await expect(promptText).toBeVisible();
    
    console.log('✅ 悬停效果正常工作');
  });

  test('点击复用应该跳转并带上prompt参数', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // 找到第一个作品并悬停
    const firstCard = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 > div').first();
    await firstCard.hover();
    
    // 获取prompt文本
    const promptText = await firstCard.locator('p.text-white').textContent();
    console.log('原始prompt:', promptText);
    
    // 点击"立即复用"
    const reuseButton = firstCard.locator('button:has-text("立即复用")');
    await reuseButton.click();
    
    // 等待导航
    await page.waitForURL(/\?prompt=/);
    
    // 验证URL包含prompt参数
    const url = new URL(page.url());
    const promptParam = url.searchParams.get('prompt');
    
    expect(promptParam).toBeTruthy();
    expect(promptParam).toBe(promptText?.trim());
    
    console.log('✅ 点击复用功能正常，prompt参数:', promptParam);
  });

  test('API应该返回正确的数据结构', async ({ request }) => {
    const response = await request.get('http://localhost:3000/api/gallery-examples');
    expect(response.ok()).toBeTruthy();
    
    const data = await response.json();
    
    // 验证响应结构
    expect(data).toHaveProperty('success', true);
    expect(data).toHaveProperty('examples');
    expect(Array.isArray(data.examples)).toBeTruthy();
    expect(data.examples.length).toBe(8);
    
    // 验证每个示例的结构
    for (const example of data.examples) {
      expect(example).toHaveProperty('id');
      expect(example).toHaveProperty('imageUrl');
      expect(example).toHaveProperty('prompt');
      expect(example).toHaveProperty('style');
    }
    
    console.log('✅ API返回正确的数据结构');
  });

  test('页面性能测试', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 等待画廊完全加载
    await page.waitForSelector('.grid.grid-cols-2.md\\:grid-cols-4 img');
    
    const loadTime = Date.now() - startTime;
    console.log(`页面加载时间: ${loadTime}ms`);
    
    // 检查是否在合理时间内加载
    expect(loadTime).toBeLessThan(10000); // 10秒内
    
    console.log('✅ 页面性能良好');
  });

  test('截图对比', async ({ page }) => {
    await page.waitForTimeout(2000);
    
    // 全页截图
    await page.screenshot({ 
      path: 'tests/screenshots/dynamic-gallery-full-test.png',
      fullPage: true 
    });
    
    // 仅画廊部分截图
    const gallerySection = page.locator('text=作品展示').locator('..');
    await gallerySection.screenshot({ 
      path: 'tests/screenshots/dynamic-gallery-section.png' 
    });
    
    // 悬停状态截图
    const firstCard = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 > div').first();
    await firstCard.hover();
    await page.waitForTimeout(500);
    await firstCard.screenshot({ 
      path: 'tests/screenshots/dynamic-gallery-hover.png' 
    });
    
    console.log('✅ 截图已保存');
  });
});

test.describe('错误处理测试', () => {
  test('API失败时应该显示占位图', async ({ page, context }) => {
    // 拦截API请求并返回错误
    await context.route('**/api/gallery-examples', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // 应该仍然显示8张图片（使用默认占位图）
    const images = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 img');
    await expect(images).toHaveCount(8);
    
    // 检查是否都是SVG占位图
    const firstImageSrc = await images.first().getAttribute('src');
    expect(firstImageSrc).toContain('.svg');
    
    console.log('✅ API失败时正确显示占位图');
  });
});

test.describe('移动端测试', () => {
  test('移动端布局应该是2列', async ({ page }) => {
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // 检查是否使用2列布局
    const gallery = page.locator('.grid.grid-cols-2.md\\:grid-cols-4');
    await expect(gallery).toBeVisible();
    
    // 获取第一行的图片
    const images = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 > div');
    const firstImage = await images.nth(0).boundingBox();
    const secondImage = await images.nth(1).boundingBox();
    const thirdImage = await images.nth(2).boundingBox();
    
    // 验证布局
    if (firstImage && secondImage && thirdImage) {
      // 第1和第2张图片应该在同一行
      expect(Math.abs(firstImage.y - secondImage.y)).toBeLessThan(10);
      // 第3张图片应该在下一行
      expect(thirdImage.y).toBeGreaterThan(firstImage.y + firstImage.height);
    }
    
    console.log('✅ 移动端2列布局正确');
  });
});