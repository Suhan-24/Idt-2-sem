import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // Wait for the splash screen to finish and disappear
  await expect(page.locator('text=Loading 100%')).toBeHidden({ timeout: 15000 });
});

test.describe('Authentication Flows', () => {
  test('should prompt for login and complete login', async ({ page }) => {
    // Click Login button in header (aria-label="Login")
    await page.click('button[aria-label="Login"]');
    
    // Should show login dialog
    const loginDialog = page.locator('text=Welcome to MedCare');
    await expect(loginDialog).toBeVisible();

    // Perform login
    await page.fill('input[placeholder="Enter your full name"]', 'John Doe');
    await page.fill('input[placeholder="10-digit number"]', '9876543210');
    await page.fill('input[placeholder="Your age"]', '30');
    await page.fill('input[placeholder="Your city"]', 'Mumbai');
    await page.click('button:has-text("Continue to MedCare")');
    
    // Should complete login (Login modal disappears)
    await expect(loginDialog).toBeHidden();
    
    // Check if Profile menu is visible (aria-label="Profile menu")
    await expect(page.locator('button[aria-label="Profile menu"]')).toBeVisible();
    
    // Visual delay at the end
    await page.waitForTimeout(2000);
  });
});
