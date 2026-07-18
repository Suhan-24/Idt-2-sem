import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Loading 100%')).toBeHidden({ timeout: 15000 });
});

test.describe('Tools and Utilities Flows', () => {
  test('should open Symptom Checker', async ({ page }) => {
    // Symptom Check floating button
    await page.click('button[aria-label="Open symptom checker"]');
    await expect(page.locator('h3:has-text("AI Symptom Checker")')).toBeVisible();
    
    // Click a common symptom
    await page.click('button:has-text("Headache")');
    
    // Analyze
    await page.click('button:has-text("Analyze Symptoms")');
    
    // Wait for the result
    await expect(page.locator('text=Low Risk')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Possible Conditions')).toBeVisible();
    
    // Delay for visual confirmation
    await page.waitForTimeout(2000);

    // Close it
    await page.click('button[aria-label="Close"]');
    await expect(page.locator('h3:has-text("AI Symptom Checker")')).not.toBeVisible();
  });

  test('should access Video Consultation', async ({ page, request }) => {
    await page.getByRole('button', { name: 'Video Consult', exact: true }).first().click();
    await expect(page.locator('h1:has-text("Video Consultation")')).toBeVisible();
    
    // Select category
    await page.click('button:has-text("General Physician")');
    await expect(page.locator('text=Dr. Anil Mehta').first()).toBeVisible();
    
    // Pick a slot and book
    await page.click('button:has-text("10:00") >> nth=0');
    await page.locator('button', { hasText: 'Book at 10:00' }).click();

    // Fill payment and pay
    await page.fill('input[placeholder*="Enter UPI ID"]', 'test@upi');
    await page.click('button:has-text("Pay")');

    // Should be scheduled
    await expect(page.locator('text=Consultation Scheduled!')).toBeVisible();

    // Verify Backend
    const response = await request.get('/api/video-consultations');
    const consultations = await response.json();
    const myConsultation = consultations.find((c: any) => c.doctor_name === 'Dr. Anil Mehta');
    expect(myConsultation).toBeDefined();
    expect(myConsultation.upi_id).toBe('test@upi');

    // Join video call (use force because of continuous animation)
    await page.click('button:has-text("Join Video Call")', { force: true });
    await expect(page.getByText('You', { exact: true }).first()).toBeVisible();
    
    // Delay for visual confirmation
    await page.waitForTimeout(2000);
  });

  test('should access Emergency Services', async ({ page, request }) => {
    await page.getByRole('button', { name: 'Emergency', exact: true }).first().click();
    await expect(page.locator('h1:has-text("Emergency Services")')).toBeVisible();
    
    await page.click('button:has-text("Allow Location Access")');
    // Wait for the found step
    await expect(page.locator('button:has-text("CALL AMBULANCE NOW")')).toBeVisible({ timeout: 5000 });
    await page.click('button:has-text("CALL AMBULANCE NOW")');
    await expect(page.locator('text=Ambulance Dispatched!')).toBeVisible();

    // Verify Backend
    const response = await request.get('/api/emergencies');
    const emergencies = await response.json();
    const myEmergency = emergencies.find((e: any) => e.location === 'Koramangala, Bengaluru, Karnataka 560034');
    expect(myEmergency).toBeDefined();
    expect(myEmergency.status).toBe('dispatched');
    
    // Delay for visual confirmation
    await page.waitForTimeout(2000);
  });
});
