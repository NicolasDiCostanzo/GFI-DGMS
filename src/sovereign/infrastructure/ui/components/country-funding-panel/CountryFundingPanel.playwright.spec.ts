import { expect, test } from '@/../e2e/coverage-fixtures';
import { MOCK_GRANT_RECORDS } from '@/sovereign/infrastructure/ui/components/InteractiveMap.playwright.spec.fixtures';

const GERMANY_ID = '276';

test.describe('CountryFundingPanel on a mobile viewport', () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test.beforeEach(async ({ page }) => {
        await page.route('https://cdn.jsdelivr.net/gh/**/grants.json', async (route) => {
            await route.fulfill({ json: MOCK_GRANT_RECORDS });
        });
        await page.goto('/');
        await page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`).click();
        await expect(page.locator('.country-funding-panel')).toBeVisible();
    });

    test('hides the resize handle and expand button, always showing the expanded state', async ({
        page,
    }) => {
        const panel = page.locator('.country-funding-panel');

        await expect(panel).toHaveClass(/is-expanded/);
        await expect(page.locator('.resize-handle')).toHaveCount(0);
        await expect(page.locator('.expand-button')).toHaveCount(0);
    });
});

test.describe('CountryFundingPanel drag-to-resize', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('https://cdn.jsdelivr.net/gh/**/grants.json', async (route) => {
            await route.fulfill({ json: MOCK_GRANT_RECORDS });
        });
        await page.goto('/');
        await page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`).click();
        await expect(page.locator('.country-funding-panel')).toBeVisible();
    });

    test('resizes the panel to follow the real container geometry while dragging', async ({
        page,
    }) => {
        const handle = page.locator('.resize-handle');
        // The panel slides in via a CSS transition; wait for it to settle so the
        // handle's bounding box reflects its final position, not a mid-animation one.
        await page.waitForTimeout(400);
        const handleBox = await handle.boundingBox();
        if (!handleBox) throw new Error('resize handle has no bounding box');

        const containerRight = await page
            .locator('.app-content')
            .evaluate((el) => el.getBoundingClientRect().right);

        const targetClientX = containerRight - 500;

        await page.mouse.move(
            handleBox.x + handleBox.width / 2,
            handleBox.y + handleBox.height / 2,
        );
        await page.mouse.down();
        await page.mouse.move(targetClientX, handleBox.y + handleBox.height / 2);
        await page.mouse.up();

        const panel = page.locator('.country-funding-panel');
        await expect(async () => {
            const width = await panel.evaluate((el) => el.getBoundingClientRect().width);
            expect(width).toBeCloseTo(containerRight - targetClientX, 0);
        }).toPass();
    });
});
