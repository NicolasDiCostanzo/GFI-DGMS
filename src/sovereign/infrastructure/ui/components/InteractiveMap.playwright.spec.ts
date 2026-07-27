import { expect, test } from '@playwright/test';

test.describe('InteractiveMap', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('renders an SVG element in the browser', async ({ page }) => {
        const svg = page.locator('svg');
        await expect(svg).toBeVisible();
    });

    test('renders all country path elements', async ({ page }) => {
        const paths = page.locator('path.country-path');
        await expect(paths).toHaveCount(241);
    });

    test('ocean background has correct color', async ({ page }) => {
        const oceanRect = page.locator('rect[fill="#e8f4f8"]');
        await expect(oceanRect).toBeVisible();
    });

    test('country paths have white border stroke', async ({ page }) => {
        const firstPath = page.locator('path.country-path').first();
        await expect(firstPath).toHaveCSS('stroke', 'rgb(255, 255, 255)');
        await expect(firstPath).toHaveCSS('stroke-opacity', '0.3');
    });

    test('country paths have color transition on fill', async ({ page }) => {
        const firstPath = page.locator('path.country-path').first();
        await expect(firstPath).toHaveCSS('transition', /fill 0\.3s/);
    });

    test('clicking a country emits country-select and shows zoom', async ({ page }) => {
        const germanyPath = page.locator('path.country-path[data-country-id="276"]');
        await expect(germanyPath).toBeVisible();

        const mapGroup = page.locator('.map-group');
        const initialTransform = await mapGroup.getAttribute('transform');
        expect(initialTransform).toBe('');

        await germanyPath.click();

        await expect(mapGroup).not.toHaveAttribute('transform', '');
    });

    test('tooltip appears on hover and shows country name', async ({ page }) => {
        const germanyPath = page.locator('path.country-path[data-country-id="276"]');
        await germanyPath.hover();

        const tooltip = page.locator('.map-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText('Germany');
    });

    test('tooltip disappears on mouse leave', async ({ page }) => {
        const germanyPath = page.locator('path.country-path[data-country-id="276"]');
        await germanyPath.hover();
        await expect(page.locator('.map-tooltip')).toBeVisible();

        await page.locator('body').hover({ force: true });
        await expect(page.locator('.map-tooltip')).not.toBeVisible();
    });

    test('legend is displayed in the corner', async ({ page }) => {
        const legend = page.locator('.map-legend');
        await expect(legend).toBeVisible();
    });

    test('legend shows gradient color labels', async ({ page }) => {
        const legendLabels = page.locator('.legend-label');
        const count = await legendLabels.count();
        expect(count).toBeGreaterThanOrEqual(5);
    });

    test('country path has cursor pointer on hover', async ({ page }) => {
        const germanyPath = page.locator('path.country-path[data-country-id="276"]');
        await expect(germanyPath).toHaveCSS('cursor', 'pointer');
    });

    test('country with simulation data has colored fill', async ({ page }) => {
        const germanyPath = page.locator('path.country-path[data-country-id="276"]');
        const fill = await germanyPath.getAttribute('fill');
        expect(fill).not.toBe('#cccccc');
    });

    test('country without simulation data has grey fill', async ({ page }) => {
        const usaPath = page.locator('path.country-path[data-country-id="840"]');
        await expect(usaPath).toHaveAttribute('fill', '#cccccc');
    });

    test('country path has aria-label with country name', async ({ page }) => {
        const germanyPath = page.locator('path.country-path[data-country-id="276"]');
        await expect(germanyPath).toHaveAttribute('aria-label', /Germany/);
    });

    test('country path aria-label includes funding progress', async ({ page }) => {
        const germanyPath = page.locator('path.country-path[data-country-id="276"]');
        await expect(germanyPath).toHaveAttribute('aria-label', /75/);
    });

    test('SVG is responsive with 100% width and height', async ({ page }) => {
        const svg = page.locator('svg');
        await expect(svg).toHaveAttribute('width', '100%');
        await expect(svg).toHaveAttribute('height', '100%');
    });

    test('SVG has viewBox attribute', async ({ page }) => {
        const svg = page.locator('svg');
        await expect(svg).toHaveAttribute('viewBox');
    });
});
