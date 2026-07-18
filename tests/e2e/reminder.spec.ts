import { test, expect } from '@playwright/test';

async function loginUser(page: any) {
  await page.click('button[aria-label="Login"]');
  await expect(page.locator('text=Welcome to MedCare')).toBeVisible();
  await page.fill('input[placeholder="Enter your full name"]', 'John Doe');
  await page.fill('input[placeholder="10-digit number"]', '9876543210');
  await page.fill('input[placeholder="Your age"]', '30');
  await page.fill('input[placeholder="Your city"]', 'Mumbai');
  await page.click('button:has-text("Continue to MedCare")');
  await expect(page.locator('text=Welcome to MedCare')).toBeHidden();
}

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Loading 100%')).toBeHidden({ timeout: 15000 });
});

test.describe('Tablet Reminder Flow', () => {
  test('should create, persist, and manage a tablet reminder', async ({ page, request }) => {
    // Navigate to reminders directly
    await page.goto('/reminder');
    
    // Ensure we are logged in
    await loginUser(page);
    
    await expect(page.locator('h1:has-text("Tablet Reminder")')).toBeVisible();

    // Add a new reminder
    await page.click('button:has-text("Add")');
    await expect(page.locator('text=Set New Reminder')).toBeVisible();
    
    // Fill the form
    await page.fill('input[placeholder*="Paracetamol"]', 'Aspirin 100mg');
    await page.fill('input[placeholder*="1 tablet"]', '1 tablet');
    await page.fill('input[type="time"]', '08:00');
    await page.fill('textarea[placeholder*="Take with food"]', 'With water');
    
    await page.click('button:has-text("Set Reminder")');
    
    // Check if added
    await expect(page.locator('text=Aspirin 100mg').first()).toBeVisible();
    
    // Reload page to test SQLite persistence
    await page.reload();
    
    // Re-login because React state is ephemeral
    await loginUser(page);
    
    // The page will now re-render with the user state and fetch reminders
    await expect(page.locator('h1:has-text("Tablet Reminder")')).toBeVisible();
    
    // Verify it is still there
    await expect(page.locator('text=Aspirin 100mg').first()).toBeVisible();
    
    // Verify Backend Persistence First
    let response = await request.get('/api/reminders?phone=9876543210');
    let remindersBody = await response.json();
    let myReminder = remindersBody.data.find((r: any) => r.tablet.includes('Aspirin 100mg'));
    expect(myReminder).toBeDefined();
    expect(myReminder.patientPhone).toBe('9876543210');
    
    // Click taken (CheckCircle)
    const toggleTakenBtn = page.locator('button[aria-label="Toggle taken"]').first();
    await toggleTakenBtn.click();
    
    // Wait for strike-through or text 'Taken'
    await expect(page.locator('text=Aspirin 100mg').first()).toBeVisible();
    
    // Click delete (Trash2)
    const deleteBtn = page.locator('button[aria-label="Delete reminder"]').first();
    await deleteBtn.click();
    
    // Wait for it to disappear
    await expect(page.locator('text=Aspirin 100mg').first()).toBeHidden();
    
    // Verify Backend Validation for Deletion
    response = await request.get('/api/reminders?phone=9876543210');
    remindersBody = await response.json();
    myReminder = remindersBody.data.find((r: any) => r.tablet.includes('Aspirin 100mg'));
    expect(myReminder).toBeUndefined();
    
    // Delay for visual confirmation
    await page.waitForTimeout(2000);
  });
});
