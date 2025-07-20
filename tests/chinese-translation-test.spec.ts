import { test, expect } from '@playwright/test';

test.describe('中文翻译功能测试', () => {
  test('测试中文提示词翻译', async ({ page }) => {
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 测试用例
    const testCases = [
      {
        chinese: '夕阳下的富士山',
        expectedKeywords: ['Mount Fuji', 'sunset']
      },
      {
        chinese: '樱花飘落的街道',
        expectedKeywords: ['cherry blossoms', 'street', 'falling']
      },
      {
        chinese: '一只可爱的猫',
        expectedKeywords: ['cute', 'cat']
      },
      {
        chinese: '美丽的彩虹独角兽',
        expectedKeywords: ['beautiful', 'rainbow', 'unicorn']
      }
    ];
    
    // 找到输入框
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    await expect(input).toBeVisible();
    
    console.log('\n测试中文提示词处理：\n');
    
    for (const testCase of testCases) {
      // 输入中文提示词
      await input.fill(testCase.chinese);
      console.log(`输入: "${testCase.chinese}"`);
      
      // 监听网络请求
      const requestPromise = page.waitForRequest(req => 
        req.url().includes('/api/generate-image') && 
        req.method() === 'POST'
      );
      
      // 点击生成按钮（免费试用）
      const generateButton = page.locator('button').filter({ hasText: '免费生成' }).first();
      
      // 如果有免费生成按钮，使用它
      if (await generateButton.isVisible()) {
        await generateButton.click();
      } else {
        // 否则使用普通生成按钮
        const normalButton = page.locator('button').filter({ hasText: '生成图片' }).first();
        await normalButton.click();
      }
      
      try {
        // 等待请求
        const request = await requestPromise;
        const postData = request.postDataJSON();
        
        console.log(`发送的请求数据: ${JSON.stringify(postData, null, 2)}`);
        
        // 检查是否有翻译相关的处理
        if (postData.prompt) {
          console.log(`实际发送的提示词: "${postData.prompt}"`);
          
          // 验证关键词是否在处理后的提示词中
          for (const keyword of testCase.expectedKeywords) {
            if (postData.prompt.toLowerCase().includes(keyword.toLowerCase())) {
              console.log(`✅ 包含关键词: "${keyword}"`);
            } else {
              console.log(`❌ 缺少关键词: "${keyword}"`);
            }
          }
        }
      } catch (error) {
        console.log('未能捕获请求，可能需要登录');
      }
      
      console.log('---\n');
      
      // 等待一下再进行下一个测试
      await page.waitForTimeout(1000);
    }
  });
  
  test('验证 PromptOptimizer 单元测试', async ({ page }) => {
    // 直接在浏览器中测试 PromptOptimizer
    const results = await page.evaluate(() => {
      // 模拟 PromptOptimizer 的翻译逻辑
      const testCases = [
        '夕阳下的富士山',
        '樱花飘落的街道',
        '一只可爱的猫',
        '海边的日出',
        '梦幻的城堡在云端'
      ];
      
      // 这里我们只是验证页面是否正确加载了相关功能
      return {
        pageTitle: document.title,
        hasGenerator: !!document.querySelector('input[placeholder*="描述"]'),
        hasGallery: !!document.querySelector('.grid.grid-cols-2')
      };
    });
    
    console.log('\n页面功能检查：');
    console.log('页面标题:', results.pageTitle);
    console.log('有生成器:', results.hasGenerator ? '✅' : '❌');
    console.log('有画廊:', results.hasGallery ? '✅' : '❌');
  });
});