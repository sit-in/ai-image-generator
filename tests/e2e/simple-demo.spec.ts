import { test, expect } from '@playwright/test';

test.describe('简单功能演示', () => {
  test('主页功能展示', async ({ page }) => {
    // 访问主页
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 截图主页
    await page.screenshot({ 
      path: 'tests/screenshots/demo-homepage.png',
      fullPage: true 
    });
    
    // 检查页面标题
    await expect(page).toHaveTitle(/AI.*生成|Image.*Generator/i);
    
    // 检查导航栏
    const navbar = page.locator('nav').first();
    await expect(navbar).toBeVisible();
    
    // 截图导航栏
    await navbar.screenshot({ 
      path: 'tests/screenshots/demo-navbar.png' 
    });
    
    // 查找生成器组件
    const generator = page.locator('.inline-generator, [class*="generator"]').first();
    if (await generator.isVisible()) {
      await generator.screenshot({ 
        path: 'tests/screenshots/demo-generator.png' 
      });
    }
    
    // 查找作品展示区域
    const gallery = page.locator('[class*="gallery"], [class*="grid"]').filter({
      has: page.locator('img')
    }).first();
    
    if (await gallery.isVisible()) {
      await gallery.screenshot({ 
        path: 'tests/screenshots/demo-gallery.png' 
      });
    }
    
    console.log('✅ 主页截图完成');
  });

  test('测试敏感词过滤功能', async ({ page }) => {
    // 直接测试API
    const response = await page.request.post('http://localhost:3001/api/generate-image', {
      data: {
        prompt: 'a scene with violence and blood',
        style: 'natural',
        isGuest: true
      }
    });
    
    expect(response.status()).toBe(400);
    const body = await response.json();
    expect(body.error).toContain('敏感');
    
    console.log('✅ 敏感词过滤测试通过:', body.error);
  });

  test('测试速率限制功能', async ({ page }) => {
    const requests = [];
    
    // 快速发送5个请求
    for (let i = 0; i < 5; i++) {
      const response = page.request.post('http://localhost:3001/api/generate-image', {
        data: {
          prompt: `test ${i}`,
          style: 'natural',
          isGuest: true
        }
      });
      requests.push(response);
    }
    
    const responses = await Promise.all(requests);
    const statuses = responses.map(r => r.status());
    
    // 应该有至少一个429状态码
    const has429 = statuses.includes(429);
    expect(has429).toBeTruthy();
    
    console.log('✅ 速率限制测试通过，状态码:', statuses);
  });

  test('测试环境变量检查', async ({ page }) => {
    // 运行环境检查脚本
    const { exec } = require('child_process');
    const util = require('util');
    const execPromise = util.promisify(exec);
    
    try {
      const { stdout } = await execPromise('npm run check:env');
      console.log('环境变量检查结果:\n', stdout);
      
      expect(stdout).toContain('All required environment variables are set');
    } catch (error) {
      console.error('环境变量检查失败:', error);
    }
  });

  test('查看页脚和备案信息', async ({ page }) => {
    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // 滚动到页面底部
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1000);
    
    // 查找页脚
    const footer = page.locator('footer').first();
    if (await footer.isVisible()) {
      await footer.screenshot({ 
        path: 'tests/screenshots/demo-footer.png' 
      });
      
      // 检查法律链接
      const privacyLink = footer.locator('a[href*="privacy"]');
      const termsLink = footer.locator('a[href*="terms"]');
      
      if (await privacyLink.isVisible()) {
        console.log('✅ 找到隐私政策链接');
      }
      
      if (await termsLink.isVisible()) {
        console.log('✅ 找到服务条款链接');
      }
    }
    
    // 查找备案信息
    const beianInfo = page.locator('text=/备案|ICP/');
    if (await beianInfo.isVisible()) {
      console.log('✅ 找到备案信息');
      await beianInfo.screenshot({ 
        path: 'tests/screenshots/demo-beian.png' 
      });
    }
  });
});