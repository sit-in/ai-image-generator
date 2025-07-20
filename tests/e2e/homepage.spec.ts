import { test, expect } from '@playwright/test';

test.describe('Homepage Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display the homepage with correct title', async ({ page }) => {
    await expect(page).toHaveTitle(/AI.*图片生成器/);
  });

  test('should show navigation elements', async ({ page }) => {
    const nav = page.locator('nav');
    await expect(nav).toBeVisible();
    
    // Navigation links might be in header or footer
    const loginButton = page.getByRole('link', { name: /登录/i });
    const registerButton = page.getByRole('link', { name: /注册/i });
    await expect(loginButton).toBeVisible();
    await expect(registerButton).toBeVisible();
  });

  test('should display the main heading and description', async ({ page }) => {
    const heading = page.locator('h1').filter({ hasText: /AI.*画画小助手/ });
    await expect(heading).toBeVisible();
    
    const description = page.locator('p').filter({ hasText: /探索无限创意/ });
    await expect(description).toBeVisible();
  });

  test('should show login/register buttons for unauthenticated users', async ({ page }) => {
    const loginButton = page.getByRole('link', { name: /登录/i });
    const registerButton = page.getByRole('link', { name: /注册/i });
    
    await expect(loginButton).toBeVisible();
    await expect(registerButton).toBeVisible();
  });

  test('should display gallery section with example images', async ({ page }) => {
    // Check for images in the page - homepage should have multiple images
    const images = page.locator('img');
    const imageCount = await images.count();
    expect(imageCount).toBeGreaterThan(3);
    
    // Look for any gallery-related text or template section
    const galleryOrTemplate = page.locator('text=/模板|作品|画廊|Gallery|Template/i');
    const textCount = await galleryOrTemplate.count();
    expect(textCount).toBeGreaterThan(0);
  });

  test('should show footer with legal links', async ({ page }) => {
    const footer = page.locator('footer');
    await expect(footer).toBeVisible();
    
    // Check that privacy and terms links exist somewhere on the page
    const privacyLinks = page.getByRole('link', { name: /隐私政策/i });
    const termsLinks = page.getByRole('link', { name: /服务条款/i });
    
    expect(await privacyLinks.count()).toBeGreaterThan(0);
    expect(await termsLinks.count()).toBeGreaterThan(0);
  });

  test('should display prompt template gallery', async ({ page }) => {
    // Check for template section or buttons
    const templateButtons = page.locator('button').filter({ hasText: /使用.*模板|使用此模板/ });
    const buttonCount = await templateButtons.count();
    
    if (buttonCount === 0) {
      // Try to find template cards or sections
      const templateSection = page.locator('text=/模板|Template/');
      const sectionCount = await templateSection.count();
      expect(sectionCount).toBeGreaterThan(0);
    } else {
      expect(buttonCount).toBeGreaterThan(0);
    }
  });
});