import { test, expect } from '@playwright/test';

test.describe('Inline Image Generator', () => {
  test.beforeEach(async ({ page }) => {
    // 访问首页
    await page.goto('http://localhost:3001');
    
    // 等待页面加载完成
    await page.waitForLoadState('networkidle');
  });

  test('内联生成器应该在首页显示', async ({ page }) => {
    // 检查输入框
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    await expect(input).toBeVisible();
    
    // 检查生成按钮
    const generateButton = page.locator('button:has-text("免费生成"), button:has-text("开始生成")');
    await expect(generateButton).toBeVisible();
    
    // 检查风格选择器
    const styleButtons = page.locator('button:has-text("自然"), button:has-text("动漫"), button:has-text("油画")');
    await expect(styleButtons.first()).toBeVisible();
  });

  test('应该能够选择不同的风格', async ({ page }) => {
    // 点击动漫风格
    const animeButton = page.locator('button:has-text("动漫")');
    await animeButton.click();
    
    // 检查是否被选中（通过背景颜色的变化）
    await expect(animeButton).toHaveClass(/from-purple-500/);
    
    // 点击油画风格
    const oilButton = page.locator('button:has-text("油画")');
    await oilButton.click();
    
    // 检查油画是否被选中
    await expect(oilButton).toHaveClass(/from-purple-500/);
    // 检查动漫是否取消选中
    await expect(animeButton).not.toHaveClass(/from-purple-500/);
  });

  test('游客应该看到免费试用提示', async ({ page }) => {
    // 检查游客提示文本
    const guestTip = page.locator('text=无需注册，立即免费试用一次');
    await expect(guestTip).toBeVisible();
    
    // 检查按钮文本
    const freeButton = page.locator('button:has-text("免费生成")');
    await expect(freeButton).toBeVisible();
  });

  test('应该能够输入提示词并尝试生成', async ({ page }) => {
    // 输入提示词
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    await input.fill('一只可爱的猫咪在花园里玩耍');
    
    // 选择动漫风格
    await page.locator('button:has-text("动漫")').click();
    
    // 点击生成按钮
    const generateButton = page.locator('button:has-text("免费生成"), button:has-text("开始生成")').first();
    await generateButton.click();
    
    // 应该显示加载状态
    const loadingText = page.locator('text=生成中');
    await expect(loadingText).toBeVisible({ timeout: 5000 });
    
    // 应该显示进度骨架屏
    const skeleton = page.locator('[class*="skeleton"], [class*="Skeleton"]').first();
    await expect(skeleton).toBeVisible();
  });

  test('应该在空提示词时显示错误提示', async ({ page }) => {
    // 清空输入框（如果有内容）
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    await input.clear();
    
    // 等待按钮变为可用状态
    await page.waitForTimeout(500);
    
    // 点击生成按钮
    const generateButton = page.locator('button:has-text("免费生成"), button:has-text("开始生成")').first();
    await generateButton.click();
    
    // 应该显示错误提示
    const errorToast = page.locator('text=请输入图片描述');
    await expect(errorToast).toBeVisible({ timeout: 5000 });
  });

  test('作品示例应该能够复用提示词', async ({ page }) => {
    // 等待作品展示区域加载
    await page.waitForSelector('text=作品展示', { timeout: 10000 });
    
    // 找到第一个作品
    const firstItem = page.locator('img[alt*="樱花"]').first();
    await expect(firstItem).toBeVisible();
    
    // 悬停在作品的父容器上
    const itemContainer = firstItem.locator('..');
    await itemContainer.hover();
    
    // 点击"立即复用"按钮
    const reuseButton = page.locator('button:has-text("立即复用")').first();
    await expect(reuseButton).toBeVisible();
    await reuseButton.click();
    
    // 应该跳转到带有 prompt 参数的页面
    await expect(page).toHaveURL(/\?prompt=/);
  });

  test('应该能够通过Enter键提交', async ({ page }) => {
    // 输入提示词
    const input = page.locator('input[placeholder*="描述你想要的图片"]');
    await input.fill('夕阳下的富士山');
    
    // 按下 Enter 键
    await input.press('Enter');
    
    // 应该开始生成
    const loadingText = page.locator('text=生成中');
    await expect(loadingText).toBeVisible({ timeout: 5000 });
  });

  test('风格选择器应该支持横向滚动', async ({ page }) => {
    // 检查风格容器是否有横向滚动
    const styleContainer = page.locator('[class*="overflow-x-auto"]').first();
    await expect(styleContainer).toBeVisible();
    
    // 检查所有风格按钮
    const styles = ['自然', '动漫', '油画', '水彩', '像素', '吉卜力'];
    for (const style of styles) {
      const button = page.locator(`button:has-text("${style}")`);
      await expect(button).toBeVisible();
    }
  });
});

// 测试认证用户的体验
test.describe('认证用户体验', () => {
  test.beforeEach(async ({ page, context }) => {
    // 模拟已登录用户
    await context.addCookies([
      {
        name: 'sb-auth-token',
        value: 'mock-auth-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    // 设置 localStorage
    await page.goto('http://localhost:3001');
    await page.evaluate(() => {
      localStorage.setItem('userId', 'mock-user-id');
    });
    
    await page.reload();
  });

  test('已登录用户应该看到"开始生成"而不是"免费生成"', async ({ page }) => {
    // 等待按钮加载
    await page.waitForSelector('button[class*="w-full"]', { timeout: 10000 });
    
    // 检查按钮文本
    const generateButton = page.locator('button:has-text("开始生成")');
    await expect(generateButton).toBeVisible();
    
    // 不应该看到游客提示
    const guestTip = page.locator('text=无需注册，立即免费试用一次');
    await expect(guestTip).not.toBeVisible();
  });
});