import { expect, test } from '@/../e2e/coverage-fixtures';
import { MOCK_GRANT_RECORDS } from '@/sovereign/infrastructure/ui/components/InteractiveMap.playwright.spec.fixtures';
import { LONG_GRANT, SHORT_GRANT } from './CountryFundingPanelTable.playwright.spec.fixtures';

const GERMANY_ID = '276';

test.describe('CountryFundingPanelTable responsive layout', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('https://cdn.jsdelivr.net/gh/**/grants.json', async (route) => {
            await route.fulfill({ json: MOCK_GRANT_RECORDS });
        });
        await page.goto('/');
        await page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`).click();
        await expect(page.locator('.country-funding-panel')).toBeVisible();
    });

    test('shows stacked cards and hides the table when the panel is narrower than 600px', async ({
        page,
    }) => {
        await expect(page.locator('.grant-card-list')).toBeVisible();
        await expect(page.locator('.table-scroll-container')).toBeHidden();
    });

    test('shows the table and hides the cards once the panel is expanded past 600px', async ({
        page,
    }) => {
        await page.locator('.expand-button').click();

        await expect(page.locator('.table-scroll-container')).toBeVisible();
        await expect(page.locator('.grant-card-list')).toBeHidden();
    });

    test('distinguishes active from inactive platform segments in the expanded table', async ({
        page,
    }) => {
        await page.locator('.expand-button').click();

        const active = page.locator('.grant-table .platform-segment.is-active').first();
        const inactive = page.locator('.grant-table .platform-segment:not(.is-active)').first();

        const [activeBg, inactiveBg] = await Promise.all([
            active.evaluate((el) => getComputedStyle(el).backgroundColor),
            inactive.evaluate((el) => getComputedStyle(el).backgroundColor),
        ]);

        expect(activeBg).not.toBe('rgba(0, 0, 0, 0)');
        expect(inactiveBg).toBe('rgba(0, 0, 0, 0)');
    });

    test('keeps every table row the same height regardless of content length', async ({ page }) => {
        await page.route('https://cdn.jsdelivr.net/gh/**/grants.json', async (route) => {
            await route.fulfill({ json: [SHORT_GRANT, LONG_GRANT] });
        });
        await page.reload();
        await page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`).click();
        await expect(page.locator('.country-funding-panel')).toBeVisible();
        await page.locator('.expand-button').click();
        await expect(page.locator('.table-scroll-container')).toBeVisible();

        const rows = page.locator('.grant-table tbody tr.grant-row');
        await expect(rows).toHaveCount(2);
        await expect(async () => {
            const heights = await rows.evaluateAll((els) =>
                els.map((el) => el.getBoundingClientRect().height),
            );
            expect(heights[0]).toBeGreaterThan(0);
            expect(heights[1]).toBeCloseTo(heights[0], 0);
        }).toPass();
    });

    test('keeps table cells laid out in separate columns, not stacked into one', async ({
        page,
    }) => {
        await page.locator('.expand-button').click();
        await expect(page.locator('.table-scroll-container')).toBeVisible();

        const xPositions = await page
            .locator('.grant-table tbody tr.grant-row')
            .first()
            .locator('td')
            .evaluateAll((cells) => cells.map((cell) => cell.getBoundingClientRect().x));

        for (let i = 1; i < xPositions.length; i++) {
            expect(xPositions[i]).toBeGreaterThan(xPositions[i - 1]);
        }
    });
});
