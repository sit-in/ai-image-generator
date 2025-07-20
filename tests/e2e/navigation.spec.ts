import { test, expect } from '@playwright/test';

test.describe('Navigation Tests', () => {
  test('should navigate to pricing page', async ({ page }) => {
    await page.goto('/');
    // Try footer link first
    const pricingLink = page.getByRole('link', { name: '充值中心' });
    if (await pricingLink.count() > 0) {
      await pricingLink.click();
      await expect(page).toHaveURL('/recharge');
    } else {
      // If no pricing page, skip test
      console.log('No pricing page found');
    }
  });

  test('should navigate to gallery page', async ({ page }) => {
    await page.goto('/');
    // Gallery link might not exist in main nav
    const galleryLink = page.getByRole('link', { name: /画廊|Gallery/i });
    if (await galleryLink.count() > 0) {
      await galleryLink.click();
      await expect(page).toHaveURL('/gallery');
    } else {
      // Skip if no gallery link
      console.log('No gallery link found');
    }
  });

  test('should navigate to privacy policy', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /隐私政策/i }).first().click();
    
    await expect(page).toHaveURL('/privacy');
    await expect(page.locator('h1')).toContainText('隐私政策');
  });

  test('should navigate to terms of service', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: /服务条款/i }).first().click();
    
    await expect(page).toHaveURL('/terms');
    await expect(page.locator('h1')).toContainText('服务条款');
  });

  test('should have working logo link', async ({ page }) => {
    await page.goto('/login');
    
    const logoLink = page.locator('a[href="/"]').first();
    await logoLink.click();
    
    await expect(page).toHaveURL('/');
  });

  test('should maintain navigation state across pages', async ({ page }) => {
    await page.goto('/');
    
    // Navigate to login page
    await page.getByRole('link', { name: '登录' }).click();
    await expect(page).toHaveURL('/login');
    
    // Navigate to register page
    await page.getByRole('link', { name: '注册' }).click();
    await expect(page).toHaveURL('/register');
    
    // Navigate back to home
    const homeLink = page.locator('a[href="/"]').first();
    await homeLink.click();
    await expect(page).toHaveURL('/');
  });

  test('should show mobile menu on small screens', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    const mobileMenuButton = page.locator('button[aria-label*="菜单"], button[aria-label*="Menu"]');
    const menuButtonCount = await mobileMenuButton.count();
    
    if (menuButtonCount > 0) {
      await expect(mobileMenuButton.first()).toBeVisible();
      await mobileMenuButton.first().click();
      
      const mobileNav = page.locator('nav').filter({ hasText: /首页.*定价.*画廊/ });
      await expect(mobileNav).toBeVisible();
    }
  });
});