import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
  await loginUser(page);
});

test.describe('Patient Dashboard Medical Records Flow', () => {
  test('should upload and persist a medical record', async ({ page, request }) => {
    // Navigate directly to dashboard
    await page.goto('/dashboard');
    
    // Ensure we are logged in
    await loginUser(page);
    
    // Switch to Records tab
    await page.click('button:has-text("Records")');

    // Create a mock file
    const testFile = Buffer.from('mock medical report content');
    const testFilePath = 'test.txt';
    
    // Set file to input
    const fileChooserPromise = page.waitForEvent('filechooser');
    await page.click('button:has-text("Upload Record")');
    const fileChooser = await fileChooserPromise;
    await fileChooser.setFiles({
      name: testFilePath,
      mimeType: 'text/plain',
      buffer: testFile
    });

    // Wait for the record to appear (test.txt)
    await expect(page.locator('text=test.txt').first().or(page.locator('text=test').first())).toBeVisible({ timeout: 5000 });
    
    // Refresh page to check if it's persisted in SQLite
    await page.reload();
    
    // Re-login because React state is ephemeral
    await loginUser(page);
    
    // Switch to Records tab again (since state resets to 'overview')
    await page.click('button:has-text("Records")');
    
    // Verify it is still there
    await expect(page.locator('text=test.txt').first().or(page.locator('text=test').first())).toBeVisible();

    // Verify Backend Persistence First
    const response = await request.get('/api/records?phone=9876543210');
    const recordsBody = await response.json();
    const myRecord = recordsBody.data.find((r: any) => r.name.includes('test'));
    expect(myRecord).toBeDefined();
    expect(myRecord.patientPhone).toBe('9876543210');

    // Delete the record
    const deleteButton = page.locator('button').filter({ has: page.locator('svg.lucide-trash-2') }).first();
    await deleteButton.click();
    
    // Confirm delete
    await page.click('button:has-text("Delete")');
    
    // Verify it is deleted
    await expect(page.locator('text=test.txt').first().or(page.locator('text=test').first())).toBeHidden();
    
    // Delay for visual confirmation
    await page.waitForTimeout(2000);
  });
});
