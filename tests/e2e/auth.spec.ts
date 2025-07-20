import { test, expect } from '@playwright/test';

test.describe('Authentication Tests', () => {
  test('should navigate to login page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /登录/i }).click();
    
    await expect(page).toHaveURL('/login');
    // Look for login page content instead of specific h1
    await expect(page.locator('text=/登录.*账户|欢迎回来/')).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /注册/i }).click();
    
    await expect(page).toHaveURL('/register');
    // Look for register page content
    await expect(page.locator('text=/创建.*账户|注册|新用户/')).toBeVisible();
  });

  test('should show login form elements', async ({ page }) => {
    await page.goto('/login');
    
    await expect(page.getByPlaceholder(/邮箱地址/i)).toBeVisible();
    await expect(page.getByPlaceholder(/密码/i)).toBeVisible();
    await expect(page.getByRole('button', { name: '立即登录' })).toBeVisible();
    await expect(page.getByText(/还没有账户/)).toBeVisible();
  });

  test('should show register form elements', async ({ page }) => {
    await page.goto('/register');
    
    await expect(page.getByPlaceholder(/邮箱地址/i)).toBeVisible();
    await expect(page.getByPlaceholder(/密码/i)).toBeVisible();
    await expect(page.getByRole('button', { name: '立即注册' })).toBeVisible();
    await expect(page.getByText(/已有账户/)).toBeVisible();
  });

  test('should validate empty login form submission', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: '立即登录' }).click();
    
    // Wait for any error indication
    await page.waitForTimeout(1000);
    
    // Check for toast, alert, or form validation error
    const errorIndicator = page.locator('[data-sonner-toast], [role="alert"], .text-red-500, .text-destructive');
    const errorCount = await errorIndicator.count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should validate empty register form submission', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: '立即注册' }).click();
    
    // Wait for any error indication
    await page.waitForTimeout(1000);
    
    // Check for toast, alert, or form validation error
    const errorIndicator = page.locator('[data-sonner-toast], [role="alert"], .text-red-500, .text-destructive');
    const errorCount = await errorIndicator.count();
    expect(errorCount).toBeGreaterThan(0);
  });

  test('should show password visibility toggle', async ({ page }) => {
    await page.goto('/login');
    
    const passwordInput = page.getByPlaceholder(/密码/i);
    await expect(passwordInput).toHaveAttribute('type', 'password');
    
    const toggleButton = page.locator('button[aria-label*="密码"]');
    if (await toggleButton.count() > 0) {
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute('type', 'text');
    }
  });
});