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
        await expect(germanyPath).toHaveAttribute('aria-label', /90/);
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

    test('scrolling the wheel over the map zooms it instead of scrolling the page', async ({
        page,
    }) => {
        const mapGroup = page.locator('.map-group');
        await expect(mapGroup).toHaveAttribute('transform', '');

        const svgBox = await page.locator('svg').boundingBox();
        await page.mouse.move(svgBox!.x + svgBox!.width / 2, svgBox!.y + svgBox!.height / 2);
        await page.mouse.wheel(0, -300);

        await expect(mapGroup).not.toHaveAttribute('transform', '');
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test('dragging with the left mouse button pans the map without selecting a country', async ({
        page,
    }) => {
        const germanyPath = page.locator('path.country-path[data-country-id="276"]');
        const box = (await germanyPath.boundingBox())!;

        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down({ button: 'left' });
        await page.mouse.move(box.x + box.width / 2 + 150, box.y + box.height / 2 + 80, {
            steps: 15,
        });
        await page.mouse.up({ button: 'left' });

        const mapGroup = page.locator('.map-group');
        await expect(mapGroup).toHaveAttribute('transform', /scale\(1\)$/);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test('dragging with the middle mouse button pans the map', async ({ page }) => {
        const svgBox = (await page.locator('svg').boundingBox())!;
        const centerX = svgBox.x + svgBox.width / 2;
        const centerY = svgBox.y + svgBox.height / 2;

        await page.mouse.move(centerX, centerY);
        await page.mouse.down({ button: 'middle' });
        await page.mouse.move(centerX - 100, centerY - 60, { steps: 15 });
        await page.mouse.up({ button: 'middle' });

        const mapGroup = page.locator('.map-group');
        await expect(mapGroup).toHaveAttribute('transform', /scale\(1\)$/);
    });

    test('a plain click on a country still selects and zooms it after a drag elsewhere', async ({
        page,
    }) => {
        const svgBox = (await page.locator('svg').boundingBox())!;
        await page.mouse.move(svgBox.x + 50, svgBox.y + 50);
        await page.mouse.down({ button: 'left' });
        await page.mouse.move(svgBox.x + 200, svgBox.y + 150, { steps: 10 });
        await page.mouse.up({ button: 'left' });

        const germanyPath = page.locator('path.country-path[data-country-id="276"]');
        await germanyPath.click();

        const mapGroup = page.locator('.map-group');
        await expect(mapGroup).toHaveAttribute('transform', /scale\(4\)$/);
    });
});
