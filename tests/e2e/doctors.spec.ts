import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Loading 100%')).toBeHidden({ timeout: 15000 });
});

test.describe('Doctor Search Flows', () => {
  test('should search and filter doctors', async ({ page }) => {
    // There are multiple ways to get to doctors, click the exact button/link
    // The link in navigation is "Find a Doctor" or similar? Let's check header 
    // Wait, the nav section is "doctors" but label is "Appointments" or "Book Appointment".
    // Let's use the Hero button "Book Appointment" or just go to #doctors
    await page.getByRole('button', { name: 'Appointments', exact: true }).first().click();
    // or if that fails, try to wait for doctor cards
    await expect(page.locator('text=Dr. Ramesh Iyer').first()).toBeVisible();

    // Search for specific doctor
    await page.fill('input[placeholder*="Search doctors"]', 'Ramesh');
    await page.waitForTimeout(500); // give it a moment to fetch
    
    // Clear search and filter by department
    await page.fill('input[placeholder*="Search doctors"]', '');
    
    await page.click('button:has-text("Cardiologist")');
    
    await page.waitForTimeout(500);
    // Should show only cardiologists (Dr. Ramesh Iyer, Dr. Priya Gupta)
    await expect(page.locator('text=Dr. Priya Gupta').first()).toBeVisible();
    await expect(page.locator('text=Dr. Anil Mehta')).not.toBeVisible();
    
    // Visual delay at the end
    await page.waitForTimeout(2000);
  });
});
