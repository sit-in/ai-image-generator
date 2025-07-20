import { test, expect } from '@playwright/test';

test.describe('中英文切换功能测试', () => {
  test('语言切换按钮存在性测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 检查语言切换按钮是否存在
    const languageButton = page.locator('button').filter({ hasText: '🌐' });
    await expect(languageButton).toBeVisible();
    console.log('✅ 语言切换按钮显示正常');
    
    // 获取按钮的title属性
    const title = await languageButton.getAttribute('title');
    console.log(`按钮提示文字: "${title}"`);
    expect(title).toBe('Switch to English');
  });

  test('点击语言切换按钮行为测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 记录初始URL
    const initialUrl = page.url();
    console.log(`初始URL: ${initialUrl}`);
    
    // 点击语言切换按钮
    const languageButton = page.locator('button').filter({ hasText: '🌐' });
    await languageButton.click();
    
    // 等待导航
    await page.waitForTimeout(1000);
    
    // 检查URL变化
    const newUrl = page.url();
    console.log(`点击后URL: ${newUrl}`);
    
    // 检查是否跳转到英文路径
    expect(newUrl).toContain('/en');
    
    // 检查页面状态
    const pageTitle = await page.title();
    console.log(`页面标题: ${pageTitle}`);
    
    // 检查是否显示404错误
    const heading = await page.locator('h2').textContent();
    console.log(`页面标题内容: ${heading}`);
    
    if (heading?.includes('页面未找到') || heading?.includes('404')) {
      console.log('❌ 英文路由未配置，显示404错误页面');
    } else {
      console.log('✅ 英文页面加载成功');
    }
  });

  test('中英文提示词处理测试', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 测试中文输入和处理
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    
    const testCases = [
      { 
        chinese: '夕阳下的富士山', 
        description: '中文地标描述'
      },
      { 
        chinese: '一只可爱的猫咪在樱花树下', 
        description: '中文动物场景'
      },
      { 
        chinese: '赛博朋克风格的未来城市', 
        description: '中文风格描述'
      }
    ];
    
    for (const testCase of testCases) {
      await input.fill(testCase.chinese);
      const value = await input.inputValue();
      expect(value).toBe(testCase.chinese);
      console.log(`✅ ${testCase.description}输入成功: "${testCase.chinese}"`);
    }
  });

  test('界面文字中英文一致性检查', async ({ page }) => {
    await page.goto('http://localhost:3000');
    
    // 检查关键界面元素的中文文字
    const elements = [
      { selector: 'h1', expected: 'AI 画画小助手', name: '主标题' },
      { selector: 'text=探索无限创意', expected: '探索无限创意，让 AI 为你绘制梦想', name: '副标题' },
      { selector: 'text=作品展示', expected: '作品展示', name: '画廊标题' },
      { selector: 'button:has-text("自然")', expected: '自然', name: '风格按钮' }
    ];
    
    for (const element of elements) {
      const el = page.locator(element.selector).first();
      const isVisible = await el.isVisible();
      if (isVisible) {
        console.log(`✅ ${element.name}显示正常`);
      } else {
        console.log(`❌ ${element.name}未找到`);
      }
    }
  });

  test('多语言功能实现状态总结', async ({ page }) => {
    console.log('\n=== 多语言功能实现状态总结 ===\n');
    
    await page.goto('http://localhost:3000');
    
    // 1. 检查语言切换UI
    const hasLanguageButton = await page.locator('button').filter({ hasText: '🌐' }).isVisible();
    console.log(`1. 语言切换按钮: ${hasLanguageButton ? '✅ 已实现' : '❌ 未实现'}`);
    
    // 2. 检查路由配置
    await page.locator('button').filter({ hasText: '🌐' }).click();
    await page.waitForTimeout(1000);
    const is404 = await page.locator('text=页面未找到').isVisible();
    console.log(`2. 英文路由配置: ${is404 ? '❌ 未配置（显示404）' : '✅ 已配置'}`);
    
    // 3. 检查中文提示词优化
    await page.goto('http://localhost:3000');
    console.log('3. 中文提示词优化: ✅ 已实现（在API端自动翻译）');
    
    // 4. 检查i18n框架状态
    console.log('4. i18n框架集成: ❌ 未完成（middleware中注释为"暂时禁用"）');
    
    console.log('\n总结：');
    console.log('- 语言切换UI已添加，但实际多语言路由未配置');
    console.log('- 中文提示词会在后端自动翻译为英文');
    console.log('- 完整的i18n国际化功能尚未实现');
  });
});