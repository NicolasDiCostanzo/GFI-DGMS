import { test, expect } from './coverage-fixtures';

test('renders the gfi-dgms-widget custom element with the greeting', async ({ page }) => {
    await page.goto('/');

    const widget = page.locator('gfi-dgms-widget');
    await expect(widget).toBeAttached();
    await expect(widget.locator('h1')).toHaveText('Hello from GFI-DGMS!');
});
