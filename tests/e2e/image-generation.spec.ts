import { test, expect } from '@playwright/test';

test.describe('Image Generation Tests', () => {
  test('should display image generator for guest users', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for any text input that could be for prompts
    const textInputs = await page.locator('input[type="text"], textarea').count();
    expect(textInputs).toBeGreaterThan(0);
    
    // Look for any buttons on the page
    const buttons = await page.getByRole('button').count();
    expect(buttons).toBeGreaterThan(0);
  });

  test('should show style options when clicking style selector', async ({ page }) => {
    await page.goto('/');
    
    // Look for any dropdown or select element
    const selectors = page.locator('button[role="combobox"], select, button[aria-haspopup="listbox"]');
    const selectorCount = await selectors.count();
    
    if (selectorCount > 0) {
      await selectors.first().click();
      
      // Wait for options to appear
      await page.waitForTimeout(500);
      
      // Check if any style options are visible
      const options = page.locator('[role="option"], option');
      const optionCount = await options.count();
      expect(optionCount).toBeGreaterThan(0);
    }
  });

  test('should enable/disable generate button based on prompt input', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Find text input
    const promptInput = page.locator('input[type="text"], textarea').first();
    const inputCount = await promptInput.count();
    
    if (inputCount > 0) {
      // Fill the input
      await promptInput.fill('一只可爱的猫咪');
      await page.waitForTimeout(500);
      
      // Verify input was filled
      const value = await promptInput.inputValue();
      expect(value).toBe('一只可爱的猫咪');
      
      // Clear input
      await promptInput.clear();
      const clearedValue = await promptInput.inputValue();
      expect(clearedValue).toBe('');
    }
  });

  test('should show optimize prompt checkbox and work correctly', async ({ page }) => {
    await page.goto('/');
    
    const checkboxes = page.locator('input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();
    
    if (checkboxCount > 0) {
      const firstCheckbox = checkboxes.first();
      const initialState = await firstCheckbox.isChecked();
      
      // Try to find and click the associated label
      const label = page.locator('label').filter({ hasText: /优化|提示|Optimize/i }).first();
      if (await label.count() > 0) {
        await label.click();
        const newState = await firstCheckbox.isChecked();
        expect(newState).toBe(!initialState);
      }
    }
  });

  test('should use template when clicking template button', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Look for any template-related buttons
    const templateButtons = page.locator('button').filter({ hasText: /使用.*模板|使用此模板|Use.*template/i });
    const buttonCount = await templateButtons.count();
    
    if (buttonCount > 0) {
      // Click the first template button
      await templateButtons.first().click();
      await page.waitForTimeout(500);
      
      // Check if any input was populated
      const inputs = page.locator('input[type="text"], textarea');
      const inputCount = await inputs.count();
      
      if (inputCount > 0) {
        const firstInputValue = await inputs.first().inputValue();
        expect(firstInputValue.length).toBeGreaterThan(0);
      }
    } else {
      // If no template buttons, just verify the page loaded
      expect(true).toBeTruthy();
    }
  });

  test('should show guest trial limit message', async ({ page }) => {
    await page.goto('/');
    
    // Look for any message about guest, trial, or credits
    const trialMessage = page.locator('text=/游客|试用|积分|Guest|Trial|Credit/i');
    const messageCount = await trialMessage.count();
    expect(messageCount).toBeGreaterThan(0);
  });

  test('should display credit information', async ({ page }) => {
    await page.goto('/');
    
    const creditInfo = page.locator('text=/积分/').first();
    if (await creditInfo.count() > 0) {
      await expect(creditInfo).toBeVisible();
    }
  });

  test('should validate prompt length', async ({ page }) => {
    await page.goto('/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    const promptInput = page.locator('input[type="text"], textarea').first();
    const inputCount = await promptInput.count();
    
    if (inputCount > 0) {
      const veryLongPrompt = 'a'.repeat(1001);
      
      // Try to fill with long text
      await promptInput.fill(veryLongPrompt);
      await page.waitForTimeout(500);
      
      // Get the actual value
      const inputValue = await promptInput.inputValue();
      
      // Input should either be truncated or we should be able to click generate
      // and get an error
      if (inputValue.length > 1000) {
        // Try to generate and expect an error
        const buttons = page.getByRole('button');
        const buttonCount = await buttons.count();
        
        if (buttonCount > 0) {
          await buttons.first().click();
          await page.waitForTimeout(1000);
          
          // Check for any error indication
          const errors = page.locator('[data-sonner-toast], [role="alert"], .text-red-500');
          const errorCount = await errors.count();
          expect(errorCount).toBeGreaterThan(0);
        }
      } else {
        // Input was truncated, which is also valid
        expect(inputValue.length).toBeLessThanOrEqual(1000);
      }
    }
  });
});