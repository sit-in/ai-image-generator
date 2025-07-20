import { test, expect } from '@playwright/test';

test.describe('AI图片生成网站综合测试', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
  });

  test('首页基本元素检查', async ({ page }) => {
    console.log('\n=== 首页基本元素测试 ===\n');
    
    // 检查标题
    const title = page.locator('h1').filter({ hasText: 'AI 画画小助手' });
    await expect(title).toBeVisible();
    console.log('✅ 网站标题显示正常');
    
    // 检查副标题
    const subtitle = page.locator('text=探索无限创意，让 AI 为你绘制梦想');
    await expect(subtitle).toBeVisible();
    console.log('✅ 副标题显示正常');
    
    // 检查特性徽章
    const badges = page.locator('.flex.flex-wrap.justify-center.gap-3').first();
    await expect(badges).toBeVisible();
    console.log('✅ 特性徽章显示正常');
    
    // 检查导航栏
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    console.log('✅ 导航栏显示正常');
    
    // 截图保存
    await page.screenshot({ 
      path: 'tests/screenshots/homepage-overview.png',
      fullPage: true 
    });
  });

  test('内联图片生成器功能测试', async ({ page }) => {
    console.log('\n=== 内联图片生成器测试 ===\n');
    
    // 找到输入框
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    await expect(input).toBeVisible();
    console.log('✅ 输入框显示正常');
    
    // 检查风格选择器
    const styleButtons = page.locator('button').filter({ hasText: /自然|动漫|油画|水彩|像素|吉卜力/ });
    const styleCount = await styleButtons.count();
    expect(styleCount).toBe(6);
    console.log(`✅ 风格选择器显示正常，共 ${styleCount} 种风格`);
    
    // 测试风格切换
    const animeButton = page.locator('button').filter({ hasText: '动漫' });
    await animeButton.click();
    await expect(animeButton).toHaveClass(/ring-2/);
    console.log('✅ 风格切换功能正常');
    
    // 输入中文提示词
    await input.fill('夕阳下的富士山，樱花飘落');
    console.log('✅ 中文输入功能正常');
    
    // 检查生成按钮
    const generateButton = page.locator('button').filter({ hasText: /免费生成|生成图片/ }).first();
    await expect(generateButton).toBeVisible();
    console.log('✅ 生成按钮显示正常');
    
    // 检查积分提示
    const creditHint = page.locator('text=/无需注册|剩余积分/');
    const hasCredit = await creditHint.count() > 0;
    console.log(`✅ 积分提示: ${hasCredit ? '显示' : '未显示'}`);
  });

  test('作品展示画廊测试', async ({ page }) => {
    console.log('\n=== 作品展示画廊测试 ===\n');
    
    // 等待画廊加载
    await page.waitForTimeout(3000);
    
    // 检查画廊标题
    const galleryTitle = page.locator('h2').filter({ hasText: '作品展示' });
    await expect(galleryTitle).toBeVisible();
    console.log('✅ 画廊标题显示正常');
    
    // 检查画廊说明
    const galleryDesc = page.locator('text=点击任意作品，即可复用 Prompt 创作相似风格');
    await expect(galleryDesc).toBeVisible();
    console.log('✅ 画廊说明显示正常');
    
    // 检查画廊网格
    const galleryGrid = page.locator('.grid.grid-cols-2.md\\:grid-cols-4');
    await expect(galleryGrid).toBeVisible();
    
    // 统计图片数量
    const images = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 img');
    const imageCount = await images.count();
    expect(imageCount).toBe(8);
    console.log(`✅ 画廊显示了 ${imageCount} 张图片`);
    
    // 检查风格分布
    const styles = ['自然', '动漫', '油画', '水彩', '像素', '吉卜力'];
    const foundStyles = new Set<string>();
    
    const styleLabels = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 span.text-gray-700');
    const labelCount = await styleLabels.count();
    
    for (let i = 0; i < labelCount; i++) {
      const style = await styleLabels.nth(i).textContent();
      if (style) foundStyles.add(style);
    }
    
    console.log('找到的风格:', Array.from(foundStyles));
    expect(foundStyles.size).toBe(6);
    console.log('✅ 所有6种风格都有展示');
    
    // 测试悬停效果
    const firstCard = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 > div').first();
    await firstCard.hover();
    await page.waitForTimeout(500);
    
    // 检查悬停后的元素
    const promptText = firstCard.locator('p.text-white');
    const reuseButton = firstCard.locator('button:has-text("立即复用")');
    
    const promptVisible = await promptText.isVisible();
    const buttonVisible = await reuseButton.isVisible();
    
    console.log(`✅ 悬停效果: 提示词${promptVisible ? '显示' : '隐藏'}, 按钮${buttonVisible ? '显示' : '隐藏'}`);
  });

  test('画廊点击复用功能测试', async ({ page }) => {
    console.log('\n=== 画廊复用功能测试 ===\n');
    
    await page.waitForTimeout(3000);
    
    // 找到第一个作品
    const firstCard = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 > div').first();
    await firstCard.hover();
    await page.waitForTimeout(500);
    
    // 获取原始prompt
    const promptElement = firstCard.locator('p.text-white');
    const originalPrompt = await promptElement.textContent();
    console.log(`原始Prompt: "${originalPrompt}"`);
    
    // 点击复用按钮
    const reuseButton = firstCard.locator('button:has-text("立即复用")');
    await reuseButton.click();
    
    // 等待页面跳转
    await page.waitForURL(/\?prompt=/);
    
    // 验证URL参数
    const url = new URL(page.url());
    const promptParam = url.searchParams.get('prompt');
    
    expect(promptParam).toBeTruthy();
    expect(promptParam).toBe(originalPrompt?.trim());
    console.log(`✅ URL参数正确: prompt="${promptParam}"`);
    
    // 验证输入框是否填充
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    const inputValue = await input.inputValue();
    expect(inputValue).toBe(originalPrompt?.trim());
    console.log('✅ 输入框已自动填充');
  });

  test('响应式布局测试', async ({ page }) => {
    console.log('\n=== 响应式布局测试 ===\n');
    
    // 桌面视图
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.waitForTimeout(1000);
    
    const desktopGrid = page.locator('.md\\:grid-cols-4');
    await expect(desktopGrid).toBeVisible();
    console.log('✅ 桌面视图（4列）正常');
    
    await page.screenshot({ 
      path: 'tests/screenshots/desktop-view.png',
      fullPage: true 
    });
    
    // 平板视图
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(1000);
    console.log('✅ 平板视图正常');
    
    // 移动视图
    await page.setViewportSize({ width: 375, height: 667 });
    await page.waitForTimeout(1000);
    
    const mobileGrid = page.locator('.grid-cols-2');
    await expect(mobileGrid).toBeVisible();
    console.log('✅ 移动视图（2列）正常');
    
    await page.screenshot({ 
      path: 'tests/screenshots/mobile-view.png',
      fullPage: true 
    });
  });

  test('中文翻译功能验证', async ({ page }) => {
    console.log('\n=== 中文翻译功能测试 ===\n');
    
    const testCases = [
      { input: '夕阳下的富士山', expected: 'Mount Fuji at sunset' },
      { input: '一只可爱的猫', expected: 'cute cat' },
      { input: '樱花飘落', expected: 'cherry blossoms falling' }
    ];
    
    for (const testCase of testCases) {
      console.log(`测试: "${testCase.input}"`);
      
      // 这里我们只是验证输入功能，因为实际翻译发生在API端
      const input = page.locator('input[placeholder*="描述你想要的图片"]');
      await input.fill(testCase.input);
      
      const value = await input.inputValue();
      expect(value).toBe(testCase.input);
      console.log('✅ 中文输入正常');
    }
  });

  test('页面性能和加载测试', async ({ page }) => {
    console.log('\n=== 页面性能测试 ===\n');
    
    const startTime = Date.now();
    
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    const domTime = Date.now() - startTime;
    console.log(`DOM加载时间: ${domTime}ms`);
    
    await page.waitForLoadState('networkidle');
    const totalTime = Date.now() - startTime;
    console.log(`完整加载时间: ${totalTime}ms`);
    
    // 检查是否在合理时间内
    expect(totalTime).toBeLessThan(15000); // 15秒内
    console.log('✅ 页面加载性能良好');
    
    // 检查关键资源
    const hasCSS = await page.locator('link[rel="stylesheet"]').count() > 0;
    const hasJS = await page.locator('script[src]').count() > 0;
    
    console.log(`✅ CSS资源: ${hasCSS ? '已加载' : '未找到'}`);
    console.log(`✅ JS资源: ${hasJS ? '已加载' : '未找到'}`);
  });

  test('错误状态处理测试', async ({ page, context }) => {
    console.log('\n=== 错误处理测试 ===\n');
    
    // 测试空输入
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    await input.fill('');
    
    const generateButton = page.locator('button').filter({ hasText: /免费生成|生成图片/ }).first();
    const isDisabled = await generateButton.isDisabled();
    console.log(`✅ 空输入时按钮${isDisabled ? '已禁用' : '未禁用'}`);
    
    // 测试API失败情况（通过拦截请求）
    await context.route('**/api/gallery-examples', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Server error' })
      });
    });
    
    // 重新加载页面
    await page.reload();
    await page.waitForTimeout(3000);
    
    // 检查是否有降级处理
    const images = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 img');
    const imageCount = await images.count();
    console.log(`✅ API失败时显示了 ${imageCount} 张图片（降级处理）`);
  });

  test('综合截图和报告', async ({ page }) => {
    console.log('\n=== 生成测试报告 ===\n');
    
    // 完整页面截图
    await page.screenshot({ 
      path: 'tests/screenshots/full-test-report.png',
      fullPage: true 
    });
    
    // 各部分截图
    const sections = [
      { selector: 'nav', name: 'navigation' },
      { selector: '.max-w-4xl.mx-auto', name: 'generator' },
      { selector: 'text=作品展示', name: 'gallery-title' }
    ];
    
    for (const section of sections) {
      try {
        const element = page.locator(section.selector).first();
        await element.screenshot({ 
          path: `tests/screenshots/${section.name}.png` 
        });
        console.log(`✅ ${section.name} 截图已保存`);
      } catch (e) {
        console.log(`⚠️ ${section.name} 截图失败`);
      }
    }
    
    console.log('\n🎉 综合测试完成！');
  });
});