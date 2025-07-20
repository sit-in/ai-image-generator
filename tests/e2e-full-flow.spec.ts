import { test, expect } from '@playwright/test';

test.describe('完整用户流程测试', () => {
  test('从首页到生成图片的完整流程', async ({ page }) => {
    console.log('\n🚀 开始完整流程测试...\n');
    
    // 1. 访问首页
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    console.log('✅ 步骤1: 成功访问首页');
    
    // 截图首页
    await page.screenshot({ 
      path: 'tests/screenshots/e2e-1-homepage.png',
      fullPage: true 
    });
    
    // 2. 检查首页基本元素
    const title = page.locator('h1').filter({ hasText: 'AI 画画小助手' });
    await expect(title).toBeVisible();
    console.log('✅ 步骤2: 首页标题显示正常');
    
    // 3. 检查内联生成器
    const generator = page.locator('.inline-generator');
    await expect(generator).toBeVisible();
    console.log('✅ 步骤3: 内联生成器显示正常');
    
    // 4. 测试风格选择
    const styles = ['自然', '动漫', '油画', '水彩', '像素', '吉卜力'];
    for (const style of styles) {
      const styleButton = page.locator('button').filter({ hasText: style });
      await expect(styleButton).toBeVisible();
    }
    console.log('✅ 步骤4: 所有6种风格按钮显示正常');
    
    // 5. 选择动漫风格
    const animeButton = page.locator('button').filter({ hasText: '动漫' });
    await animeButton.click();
    await page.waitForTimeout(500);
    console.log('✅ 步骤5: 成功选择动漫风格');
    
    // 6. 检查作品展示画廊
    await page.waitForTimeout(2000); // 等待画廊加载
    const galleryGrid = page.locator('.grid.grid-cols-2.md\\:grid-cols-4').first();
    await expect(galleryGrid).toBeVisible();
    const galleryItems = galleryGrid.locator('> div');
    const galleryCount = await galleryItems.count();
    expect(galleryCount).toBe(8);
    console.log(`✅ 步骤6: 作品展示画廊显示了 ${galleryCount} 个作品`);
    
    // 7. 点击画廊第二个作品
    const secondItem = galleryItems.nth(1);
    await secondItem.hover();
    await page.waitForTimeout(500);
    
    // 获取prompt文本
    const promptText = await secondItem.locator('p.text-white').textContent();
    console.log(`   画廊作品Prompt: "${promptText}"`);
    
    await secondItem.click();
    await page.waitForTimeout(1000);
    
    // 验证输入框填充
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    const filledValue = await input.inputValue();
    expect(filledValue).toBe(promptText?.trim());
    console.log('✅ 步骤7: 点击画廊作品后自动填充输入框');
    
    // 8. 清空输入，滚动到模板库
    await input.fill('');
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(1000);
    
    // 9. 检查Prompt模板库
    const templateTitle = page.locator('h2').filter({ hasText: 'Prompt 模板库' });
    await expect(templateTitle).toBeVisible();
    console.log('✅ 步骤8: Prompt模板库显示正常');
    
    // 截图模板库
    await page.screenshot({ 
      path: 'tests/screenshots/e2e-2-templates.png',
      fullPage: false 
    });
    
    // 10. 选择奇幻幻想分类
    const fantasyButton = page.locator('button').filter({ hasText: '奇幻幻想' });
    await fantasyButton.click();
    await page.waitForTimeout(500);
    console.log('✅ 步骤9: 成功切换到奇幻幻想分类');
    
    // 11. 选择魔法图书馆模板
    const libraryTemplate = page.locator('text=魔法图书馆').first();
    await expect(libraryTemplate).toBeVisible();
    await libraryTemplate.click();
    await page.waitForTimeout(1000);
    
    // 验证自动滚动和填充
    const scrolledInput = page.locator('input[placeholder*="描述你想要的图片"]');
    const templateValue = await scrolledInput.inputValue();
    expect(templateValue).toContain('古老的魔法图书馆');
    console.log('✅ 步骤10: 选择模板后自动填充并滚动到生成器');
    
    // 12. 检查生成按钮状态
    const generateButton = page.locator('button').filter({ hasText: /开始生成|免费生成/ }).first();
    const isEnabled = await generateButton.isEnabled();
    expect(isEnabled).toBe(true);
    console.log('✅ 步骤11: 生成按钮已启用');
    
    // 13. 检查游客试用提示
    const guestHint = page.locator('text=无需注册，立即免费试用一次');
    const hasGuestHint = await guestHint.isVisible();
    if (hasGuestHint) {
      console.log('✅ 步骤12: 游客试用提示显示正常');
    } else {
      console.log('ℹ️ 步骤12: 用户已登录或已使用过试用');
    }
    
    // 14. 检查导航栏
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // 验证语言切换按钮已移除
    const langButton = page.locator('button').filter({ hasText: '🌐' });
    const langVisible = await langButton.isVisible();
    expect(langVisible).toBe(false);
    console.log('✅ 步骤13: 语言切换按钮已成功移除');
    
    // 15. 检查注册/登录按钮
    const registerButton = page.locator('button').filter({ hasText: '注册' });
    const loginButton = page.locator('button').filter({ hasText: '登录' });
    const hasAuthButtons = await registerButton.isVisible() || await loginButton.isVisible();
    console.log(`✅ 步骤14: 认证按钮${hasAuthButtons ? '显示正常' : '未显示(用户已登录)'}`);
    
    // 16. 检查页脚
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    console.log('✅ 步骤15: 页脚显示正常');
    
    // 最终截图
    await page.screenshot({ 
      path: 'tests/screenshots/e2e-3-final.png',
      fullPage: true 
    });
    
    console.log('\n🎉 完整流程测试通过！所有功能正常工作。\n');
  });
  
  test('移动端响应式测试', async ({ page }) => {
    console.log('\n📱 开始移动端测试...\n');
    
    // 设置移动端视口
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 1. 检查移动端布局
    const mobileNav = page.locator('nav');
    await expect(mobileNav).toBeVisible();
    console.log('✅ 移动端导航栏显示正常');
    
    // 2. 检查标题是否简化
    const mobileTitle = page.locator('h1.text-xl'); // 移动端使用较小字体
    const titleVisible = await mobileTitle.isVisible();
    console.log(`✅ 移动端标题${titleVisible ? '已优化' : '使用默认样式'}`);
    
    // 3. 检查画廊网格
    await page.waitForTimeout(2000);
    const mobileGallery = page.locator('.grid.grid-cols-2');
    await expect(mobileGallery).toBeVisible();
    console.log('✅ 移动端画廊显示为2列布局');
    
    // 4. 检查生成器输入框
    const mobileInput = page.locator('input[placeholder*="描述你想要的图片"]');
    await expect(mobileInput).toBeVisible();
    const inputWidth = await mobileInput.boundingBox();
    console.log(`✅ 移动端输入框宽度: ${inputWidth?.width}px`);
    
    // 5. 滚动测试模板库
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(1000);
    
    const mobileTemplates = page.locator('.grid.grid-cols-1.md\\:grid-cols-2');
    const templatesVisible = await mobileTemplates.isVisible();
    console.log(`✅ 移动端模板库${templatesVisible ? '显示为单列' : '使用响应式布局'}`);
    
    // 截图移动端
    await page.screenshot({ 
      path: 'tests/screenshots/e2e-mobile.png',
      fullPage: true 
    });
    
    console.log('\n✅ 移动端测试完成！\n');
  });
  
  test('错误处理和边界情况测试', async ({ page }) => {
    console.log('\n⚠️ 开始错误处理测试...\n');
    
    await page.goto('http://localhost:3000');
    
    // 1. 测试空输入
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    await input.fill('');
    
    const generateButton = page.locator('button').filter({ hasText: /开始生成|免费生成/ }).first();
    const isDisabled = await generateButton.isDisabled();
    expect(isDisabled).toBe(true);
    console.log('✅ 空输入时生成按钮正确禁用');
    
    // 2. 测试超长输入
    const longText = '这是一个非常长的提示词'.repeat(50);
    await input.fill(longText);
    const actualValue = await input.inputValue();
    console.log(`✅ 输入框可以处理长文本 (${actualValue.length} 字符)`);
    
    // 3. 测试特殊字符
    await input.fill('测试<script>alert("xss")</script>特殊字符');
    const specialValue = await input.inputValue();
    expect(specialValue).toContain('测试');
    expect(specialValue).toContain('特殊字符');
    console.log('✅ 输入框正确处理特殊字符');
    
    // 4. 测试快速点击
    await input.fill('测试图片');
    for (let i = 0; i < 3; i++) {
      const styleButtons = page.locator('button').filter({ hasText: /自然|动漫|油画/ });
      const randomButton = styleButtons.nth(i);
      await randomButton.click();
      await page.waitForTimeout(100);
    }
    console.log('✅ 快速切换风格不会导致崩溃');
    
    // 5. 测试网络错误情况（如果API失败）
    // 这里我们只是检查UI的稳定性
    const elements = [
      page.locator('nav'),
      page.locator('.inline-generator'),
      page.locator('footer')
    ];
    
    for (const element of elements) {
      await expect(element).toBeVisible();
    }
    console.log('✅ 所有核心UI元素保持稳定');
    
    console.log('\n✅ 错误处理测试完成！\n');
  });
  
  test('性能和加载时间测试', async ({ page }) => {
    console.log('\n⏱️ 开始性能测试...\n');
    
    const startTime = Date.now();
    
    // 1. 首页加载时间
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('domcontentloaded');
    const domTime = Date.now() - startTime;
    console.log(`📊 DOM加载时间: ${domTime}ms`);
    
    await page.waitForLoadState('networkidle');
    const totalTime = Date.now() - startTime;
    console.log(`📊 完整加载时间: ${totalTime}ms`);
    
    // 2. 画廊加载时间
    const galleryStart = Date.now();
    await page.waitForSelector('.grid.grid-cols-2.md\\:grid-cols-4 img', { 
      state: 'visible',
      timeout: 10000 
    });
    const galleryTime = Date.now() - galleryStart;
    console.log(`📊 画廊图片加载时间: ${galleryTime}ms`);
    
    // 3. 交互响应时间
    const interactionStart = Date.now();
    const firstGalleryItem = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 > div').first();
    await firstGalleryItem.click();
    await page.waitForTimeout(100);
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    await input.waitFor({ state: 'visible' });
    const interactionTime = Date.now() - interactionStart;
    console.log(`📊 点击响应时间: ${interactionTime}ms`);
    
    // 4. 性能评估
    const metrics = {
      domLoad: domTime < 2000 ? '优秀' : domTime < 4000 ? '良好' : '需优化',
      fullLoad: totalTime < 5000 ? '优秀' : totalTime < 10000 ? '良好' : '需优化',
      gallery: galleryTime < 3000 ? '优秀' : galleryTime < 6000 ? '良好' : '需优化',
      interaction: interactionTime < 500 ? '优秀' : interactionTime < 1000 ? '良好' : '需优化'
    };
    
    console.log('\n📊 性能评估结果:');
    console.log(`   DOM加载: ${metrics.domLoad} (${domTime}ms)`);
    console.log(`   完整加载: ${metrics.fullLoad} (${totalTime}ms)`);
    console.log(`   画廊加载: ${metrics.gallery} (${galleryTime}ms)`);
    console.log(`   交互响应: ${metrics.interaction} (${interactionTime}ms)`);
    
    console.log('\n✅ 性能测试完成！\n');
  });
});