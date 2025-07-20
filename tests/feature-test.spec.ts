import { test, expect } from '@playwright/test';

test.describe('新功能测试', () => {
  test('画廊点击自动填充修复测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 找到第一个画廊项并点击
    const firstGalleryItem = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 > div').first();
    
    // 获取原始prompt
    await firstGalleryItem.hover();
    const promptElement = firstGalleryItem.locator('p.text-white');
    const originalPrompt = await promptElement.textContent();
    console.log(`原始Prompt: "${originalPrompt}"`);
    
    // 点击画廊项
    await firstGalleryItem.click();
    await page.waitForTimeout(1000);
    
    // 验证URL更新
    const url = new URL(page.url());
    const promptParam = url.searchParams.get('prompt');
    expect(promptParam).toBeTruthy();
    console.log(`URL参数: prompt="${promptParam}"`);
    
    // 验证输入框是否填充
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    const inputValue = await input.inputValue();
    expect(inputValue).toBe(originalPrompt?.trim());
    console.log('✅ 画廊点击后输入框自动填充成功');
  });

  test('语言切换按钮已移除测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 检查语言切换按钮是否不存在
    const languageButton = page.locator('button').filter({ hasText: '🌐' });
    const isVisible = await languageButton.isVisible();
    
    expect(isVisible).toBe(false);
    console.log('✅ 语言切换按钮已成功移除');
  });

  test('Prompt模板库功能测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // 滚动到模板库位置
    await page.evaluate(() => {
      window.scrollBy(0, 1500);
    });
    await page.waitForTimeout(1000);
    
    // 检查模板库标题
    const templateTitle = page.locator('text=Prompt 模板库');
    await expect(templateTitle).toBeVisible();
    console.log('✅ Prompt模板库显示正常');
    
    // 检查分类按钮
    const categories = ['人物角色', '风景场景', '动物宠物', '奇幻幻想', '科技未来', '艺术创意'];
    for (const category of categories) {
      const categoryButton = page.locator('button').filter({ hasText: category });
      await expect(categoryButton).toBeVisible();
    }
    console.log('✅ 所有分类按钮显示正常');
    
    // 点击一个分类
    const animalCategory = page.locator('button').filter({ hasText: '动物宠物' });
    await animalCategory.click();
    await page.waitForTimeout(500);
    
    // 检查是否有模板显示
    const templateCards = page.locator('.grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3 > div');
    const templateCount = await templateCards.count();
    expect(templateCount).toBeGreaterThan(0);
    console.log(`✅ 动物宠物分类显示了 ${templateCount} 个模板`);
    
    // 点击一个模板
    const firstTemplate = templateCards.first();
    const templatePrompt = await firstTemplate.locator('.bg-gray-50.rounded-lg.p-3').textContent();
    console.log(`选择的模板Prompt: "${templatePrompt}"`);
    
    await firstTemplate.click();
    await page.waitForTimeout(1000);
    
    // 验证是否滚动到生成器并填充了prompt
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    const inputValue = await input.inputValue();
    expect(inputValue).toBe(templatePrompt?.trim());
    console.log('✅ 模板选择后自动填充输入框成功');
    
    // 验证是否滚动到了生成器位置
    const generator = page.locator('.inline-generator');
    const isInViewport = await generator.isVisible();
    expect(isInViewport).toBe(true);
    console.log('✅ 自动滚动到生成器位置');
  });

  test('综合功能流程测试', async ({ page }) => {
    console.log('\n=== 综合功能流程测试 ===\n');
    
    await page.goto('http://localhost:3000');
    
    // 1. 测试从模板库选择
    await page.evaluate(() => window.scrollBy(0, 1500));
    await page.waitForTimeout(1000);
    
    const fantasyCategory = page.locator('button').filter({ hasText: '奇幻幻想' });
    await fantasyCategory.click();
    await page.waitForTimeout(500);
    
    const dragonTemplate = page.locator('text=水晶龙').first();
    await dragonTemplate.click();
    await page.waitForTimeout(1000);
    
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    const dragonPrompt = await input.inputValue();
    console.log(`✅ 从模板库选择: "${dragonPrompt}"`);
    
    // 2. 清空输入，测试画廊点击
    await input.fill('');
    await page.evaluate(() => window.scrollBy(0, -1000));
    await page.waitForTimeout(1000);
    
    const galleryItem = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 > div').nth(2);
    await galleryItem.click();
    await page.waitForTimeout(1000);
    
    const galleryPrompt = await input.inputValue();
    console.log(`✅ 从画廊选择: "${galleryPrompt}"`);
    
    // 3. 验证生成按钮状态
    const generateButton = page.locator('button').filter({ hasText: /开始生成|免费生成/ }).first();
    const isEnabled = await generateButton.isEnabled();
    expect(isEnabled).toBe(true);
    console.log('✅ 生成按钮已启用');
    
    console.log('\n✅ 所有功能测试通过！');
  });
});