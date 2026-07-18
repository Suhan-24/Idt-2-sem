import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('text=Loading 100%')).toBeHidden({ timeout: 15000 });
});

test.describe('Medicine Shop Flows', () => {
  test('should search, add to cart, checkout, and verify backend', async ({ page, request }) => {
    // Click Medicine in Nav
    await page.click('text=Medicine Shop');
    await expect(page.locator('h1:has-text("Medicine Shop")')).toBeVisible();

    // Search for Paracetamol
    await page.fill('input[placeholder="Search medicines..."]', 'Paracetamol');
    await page.waitForTimeout(500);
    
    // Add to cart
    await page.locator('div', { hasText: 'Paracetamol 500mg' }).locator('button:has-text("Add to Cart")').first().click();
    
    // Open Cart
    await page.click('button:has-text("Cart")');
    await expect(page.locator('h3:has-text("Your Cart")')).toBeVisible();
    
    // Proceed to checkout
    await page.click('button:has-text("Proceed to Checkout")');
    await expect(page.locator('h3:has-text("Delivery Address")')).toBeVisible();

    // Fill address
    await page.fill('input[type="text"] >> nth=0', 'Test User'); // Name
    await page.fill('input[type="tel"]', '9999999999'); // Phone
    await page.fill('input[type="text"] >> nth=1', '123 Test St'); // Addr
    await page.fill('input[type="text"] >> nth=2', '123456'); // PIN
    
    // Place Order
    await page.click('button:has-text("Place Order")');
    
    // Success screen
    await expect(page.locator('text=Order Placed Successfully!')).toBeVisible();

    // Verify Backend
    const response = await request.get('/api/orders');
    const orders = await response.json();
    const myOrder = orders.find((o: any) => o.name === 'Test User');
    expect(myOrder).toBeDefined();
    expect(myOrder.status).toBe('processing');
    
    // Visual delay at the end
    await page.waitForTimeout(2000);
  });
});
