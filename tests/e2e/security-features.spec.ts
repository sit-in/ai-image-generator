import { test, expect } from '@playwright/test';

test.describe('Security Features Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:3001');
  });

  test('should handle sensitive words in prompts', async ({ page }) => {
    // 导航到生成页面
    await page.goto('http://localhost:3001/generate');
    
    // 等待页面加载
    await page.waitForLoadState('networkidle');
    
    // 查找提示词输入框
    const promptInput = page.locator('textarea[placeholder*="描述"]').first();
    await expect(promptInput).toBeVisible();
    
    // 输入包含敏感词的提示
    await promptInput.fill('a violent scene with blood');
    
    // 查找生成按钮
    const generateButton = page.locator('button').filter({ hasText: /生成|创作|开始/ }).first();
    await expect(generateButton).toBeVisible();
    
    // 点击生成
    await generateButton.click();
    
    // 应该显示错误提示
    const errorMessage = page.locator('text=/敏感|不当|修改/');
    await expect(errorMessage).toBeVisible({ timeout: 10000 });
    
    // 截图
    await page.screenshot({ path: 'tests/screenshots/sensitive-words-error.png' });
  });

  test('should enforce guest trial limit', async ({ page, context }) => {
    // 清除所有 cookies 和 localStorage
    await context.clearCookies();
    await page.evaluate(() => localStorage.clear());
    
    // 访问主页
    await page.goto('http://localhost:3001');
    
    // 查找游客试用按钮或生成器
    const trialButton = page.locator('button').filter({ hasText: /试用|免费|体验/ }).first();
    
    if (await trialButton.isVisible()) {
      await trialButton.click();
    } else {
      await page.goto('http://localhost:3001/generate');
    }
    
    // 等待生成器加载
    await page.waitForLoadState('networkidle');
    
    // 第一次生成（应该成功）
    const promptInput = page.locator('textarea[placeholder*="描述"]').first();
    await promptInput.fill('a cute cat');
    
    const generateButton = page.locator('button').filter({ hasText: /生成|创作/ }).first();
    await generateButton.click();
    
    // 等待生成完成或显示注册提示
    await page.waitForTimeout(5000);
    
    // 截图第一次生成
    await page.screenshot({ path: 'tests/screenshots/guest-first-generation.png' });
    
    // 尝试第二次生成（应该被阻止）
    await page.reload();
    await promptInput.fill('a beautiful flower');
    await generateButton.click();
    
    // 应该显示试用已用完的提示
    const trialUsedMessage = page.locator('text=/已.*试用|注册.*继续|免费.*次数/');
    await expect(trialUsedMessage).toBeVisible({ timeout: 10000 });
    
    // 截图
    await page.screenshot({ path: 'tests/screenshots/guest-trial-limit.png' });
  });

  test('should show environment warnings in console', async ({ page }) => {
    const consoleLogs: string[] = [];
    
    // 监听控制台消息
    page.on('console', msg => {
      consoleLogs.push(msg.text());
    });
    
    // 访问 API 端点触发警告
    await page.goto('http://localhost:3001/api/generate-image', { 
      waitUntil: 'domcontentloaded' 
    });
    
    // 检查是否有 CSRF 相关警告
    const hasCSRFWarning = consoleLogs.some(log => 
      log.includes('CSRF_SECRET') || log.includes('csrf')
    );
    
    console.log('Console logs:', consoleLogs);
    
    // 在开发环境中应该有警告
    if (process.env.NODE_ENV !== 'production') {
      expect(hasCSRFWarning).toBeTruthy();
    }
  });

  test('should validate image generation with proper auth', async ({ page }) => {
    // 访问生成页面
    await page.goto('http://localhost:3001/generate');
    
    // 检查是否需要登录
    const loginButton = page.locator('button').filter({ hasText: /登录|Login/ });
    const generateButton = page.locator('button').filter({ hasText: /生成|创作/ });
    
    // 如果有登录按钮，说明需要认证
    if (await loginButton.isVisible()) {
      await page.screenshot({ path: 'tests/screenshots/auth-required.png' });
    }
    
    // 如果有生成按钮，检查是否显示游客试用提示
    if (await generateButton.isVisible()) {
      const guestTip = page.locator('text=/游客|试用|免费.*一次/');
      const hasGuestTip = await guestTip.isVisible();
      
      expect(hasGuestTip).toBeTruthy();
      await page.screenshot({ path: 'tests/screenshots/guest-mode-tip.png' });
    }
  });
});

test.describe('Rate Limiting Tests', () => {
  test('should enforce rate limits on API', async ({ page }) => {
    const results: Response[] = [];
    
    // 快速发送多个请求
    for (let i = 0; i < 5; i++) {
      const response = await page.request.post('http://localhost:3001/api/generate-image', {
        data: {
          prompt: `test prompt ${i}`,
          style: 'natural',
          isGuest: true
        }
      });
      
      results.push(response);
      
      // 如果返回 429，说明速率限制生效
      if (response.status() === 429) {
        const body = await response.json();
        expect(body.error).toContain('频繁');
        console.log('Rate limit triggered after', i + 1, 'requests');
        break;
      }
    }
    
    // 应该有至少一个请求被速率限制
    const hasRateLimit = results.some(r => r.status() === 429);
    expect(hasRateLimit).toBeTruthy();
  });
});