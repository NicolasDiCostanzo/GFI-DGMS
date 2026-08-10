import { expect, test } from '@/../e2e/coverage-fixtures';

test.describe('ThemeToggle', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('a real keyboard Enter press opens the dropdown and selects a theme', async ({ page }) => {
        const toggleButton = page.locator('.theme-toggle-button');
        await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
        await toggleButton.focus();
        await page.keyboard.press('Enter');

        const dropdown = page.locator('.theme-toggle-dropdown');
        await expect(dropdown).toBeVisible();
        await expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

        await page.keyboard.press('Tab');
        const firstOption = page.locator('.theme-toggle-option').first();
        await expect(firstOption).toBeFocused();
        const firstOptionLabel = await firstOption
            .locator('.theme-toggle-option-label')
            .innerText();

        await page.keyboard.press('Enter');

        await expect(dropdown).not.toBeVisible();
        await expect(toggleButton).toHaveAttribute('aria-expanded', 'false');
        await expect(toggleButton.locator('.theme-toggle-label')).toHaveText(firstOptionLabel);
    });
});
