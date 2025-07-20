import { test, expect } from '@playwright/test';

test.describe('Debug Gallery Loading', () => {
  test('check gallery loading state', async ({ page }) => {
    // Enable console logging
    page.on('console', msg => console.log('Browser console:', msg.text()));
    page.on('pageerror', error => console.log('Page error:', error));
    
    await page.goto('http://localhost:3001');
    
    // Wait for initial load
    await page.waitForLoadState('networkidle');
    
    // Check if loading skeletons are present
    const skeletons = page.locator('.aspect-square.bg-gray-100.animate-pulse');
    const skeletonCount = await skeletons.count();
    console.log(`Loading skeletons found: ${skeletonCount}`);
    
    // Wait longer for gallery to load
    await page.waitForTimeout(5000);
    
    // Check if gallery images are loaded
    const images = page.locator('.grid.grid-cols-2.md\\:grid-cols-4 img');
    const imageCount = await images.count();
    console.log(`Images found after wait: ${imageCount}`);
    
    // Check if gallery grid is visible
    const galleryGrid = page.locator('.grid.grid-cols-2.md\\:grid-cols-4').first();
    const isVisible = await galleryGrid.isVisible();
    console.log(`Gallery grid visible: ${isVisible}`);
    
    // Get the actual HTML to debug
    const gridHtml = await galleryGrid.innerHTML();
    console.log('Gallery HTML:', gridHtml.substring(0, 200) + '...');
    
    // Check network requests
    const apiResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/gallery-examples');
        const data = await response.json();
        return { success: true, data };
      } catch (error) {
        return { success: false, error: error.message };
      }
    });
    
    console.log('API response from browser:', JSON.stringify(apiResponse, null, 2));
    
    // Take a screenshot for debugging
    await page.screenshot({ path: 'tests/screenshots/debug-gallery-state.png', fullPage: true });
  });
});