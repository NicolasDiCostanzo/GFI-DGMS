import { expect, test } from '@/../e2e/coverage-fixtures';
import { MOCK_GRANT_RECORDS } from '@/sovereign/infrastructure/ui/components/InteractiveMap.playwright.spec.fixtures';

const GERMANY_ID = '276';

test.describe('GrantDetailsModal focus trap', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('https://cdn.jsdelivr.net/gh/**/grants.json', async (route) => {
            await route.fulfill({ json: MOCK_GRANT_RECORDS });
        });
        await page.goto('/');
        await page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`).click();
        await expect(page.locator('.country-funding-panel')).toBeVisible();
        await page.locator('.expand-button').click();
    });

    test('moves focus into the dialog on open and restores it to the trigger on close, over the real overlay', async ({
        page,
    }) => {
        const trigger = page.locator('button.description-toggle').first();
        await trigger.focus();

        await trigger.click();

        const dialog = page.locator('.grant-modal');
        await expect(dialog).toBeVisible();
        await expect(dialog).toBeFocused();

        await page.locator('.grant-modal-close-button').click();

        await expect(dialog).toBeHidden();
        await expect(trigger).toBeFocused();
    });
});
