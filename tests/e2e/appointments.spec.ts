import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Loading 100%')).toBeHidden({ timeout: 15000 });
});

test.describe('Appointment Booking Flow', () => {
  test('should allow booking an appointment after login', async ({ page }) => {
    // 1. Login first
    await page.click('button[aria-label="Login"]');
    await page.fill('input[placeholder="Enter your full name"]', 'John Doe');
    await page.fill('input[placeholder="10-digit number"]', '9876543210');
    await page.fill('input[placeholder="Your age"]', '30');
    await page.fill('input[placeholder="Your city"]', 'Mumbai');
    await page.click('button:has-text("Continue to MedCare")');
    await expect(page.locator('text=Welcome to MedCare')).toBeHidden();

    // 2. Go to Doctors (Appointments in Nav)
    await page.getByRole('button', { name: 'Appointments', exact: true }).first().click();
    // Wait for the Doctor Search screen to be active
    await expect(page.locator('text=Choose Department')).toBeVisible();
    
    // 3. Select a doctor (e.g., Dr. Sanjay Patel)
    await page.fill('input[placeholder*="Search doctors"]', 'Sanjay');
    await page.waitForTimeout(500);
    await page.locator('button', { hasText: 'Book Appointment' }).first().click({ force: true });
    await expect(page.locator('h2:has-text("Dr. Sanjay Patel")')).toBeVisible();

    // 4. Fill booking form
    const futureDate = new Date();
    // Add a random number of days between 7 and 100 to avoid slot exhaustion in repeated test runs
    const randomDays = Math.floor(Math.random() * 93) + 7;
    futureDate.setDate(futureDate.getDate() + randomDays);
    const dateStr = futureDate.toISOString().split('T')[0];
    await page.fill('input[type="date"]', dateStr);
    
    // Select slot (just pick the first button with PM)
    await page.locator('button:has-text("PM"):not([disabled])').first().click();

    // Click confirm (the button has the text "Confirm Appointment")
    await page.locator('button', { hasText: 'Confirm Appointment' }).click();

    // 5. Confirm Step
    await expect(page.locator('h2:has-text("Confirm Appointment")')).toBeVisible();
    await page.click('button:has-text("Confirm & Book")');

    // 6. Success Step
    await expect(page.locator('h2:has-text("Appointment Booked Successfully!")')).toBeVisible();
    await page.click('button:has-text("Back to Home")');

    // 7. Verify in My Appointments
    await page.getByRole('button', { name: 'My Appointments', exact: true }).first().click();
    await expect(page.locator('text=Dr. Sanjay Patel').first()).toBeVisible();
    
    // Visual delay at the end
    await page.waitForTimeout(2000);
  });
});
