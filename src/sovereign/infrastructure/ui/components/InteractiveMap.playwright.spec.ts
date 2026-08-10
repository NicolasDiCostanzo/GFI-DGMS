import { expect, test } from '@/../e2e/coverage-fixtures';
import { DARK_THEME_COLORS, MapColors, toRGB } from '@/sovereign/domain/constants/MapColors';
import { CountryId } from '@/sovereign/domain/Country';
import { GERMANY } from './InteractiveMap.spec.fixture';

const GERMANY_ID = CountryId('276');
const USA_ID = CountryId('840');
const OCEAN_COLOR = DARK_THEME_COLORS.OCEAN;
const INACTIVE_COLOR = MapColors.INACTIVE;
const BORDER_COLOR = DARK_THEME_COLORS.BORDER;
const SELECTION_COLOR = MapColors.SELECTION;

test.describe('InteractiveMap', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/');
    });

    test('renders an SVG element in the browser', async ({ page }) => {
        const svg = page.locator('svg[width="100%"]');
        await expect(svg).toBeVisible();
    });

    test('renders all country path elements', async ({ page }) => {
        const paths = page.locator('path.country-path');
        await expect(paths).toHaveCount(177);
    });

    test('mounts as a standalone app with no shadow-DOM encapsulation', async ({ page }) => {
        const hasWidget = await page.evaluate(
            () => document.querySelector('gfi-dgms-widget') !== null,
        );
        expect(hasWidget).toBe(false);

        const appRoot = page.locator('#app');
        await expect(appRoot).toBeVisible();
    });

    test('ocean background has correct color', async ({ page }) => {
        const oceanRect = page.locator(`rect[fill="${OCEAN_COLOR}"]`);
        await expect(oceanRect).toBeVisible();
    });

    test('country paths have black border stroke', async ({ page }) => {
        const firstPath = page.locator('path.country-path').first();
        await expect(firstPath).toHaveCSS('stroke', toRGB(BORDER_COLOR));
        await expect(firstPath).toHaveCSS('stroke-opacity', '0.35');
    });

    test('country paths have color transition on fill', async ({ page }) => {
        const germanyPath = page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`);
        await expect(germanyPath).toHaveCSS('transition', /fill 0\.3s/);
    });

    test('tooltip appears on hover and shows country name', async ({ page }) => {
        const germanyPath = page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`);
        await germanyPath.hover();

        const tooltip = page.locator('.map-tooltip');
        await expect(tooltip).toBeVisible();
        await expect(tooltip).toContainText(GERMANY.name);
    });

    test('tooltip disappears on mouse leave', async ({ page }) => {
        const germanyPath = page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`);
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
        const germanyPath = page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`);
        await expect(germanyPath).toHaveCSS('cursor', 'pointer');
    });

    test('country with simulation data has colored fill', async ({ page }) => {
        const germanyPath = page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`);
        const fill = await germanyPath.getAttribute('fill');
        expect(fill).not.toBe(INACTIVE_COLOR);
    });

    test('country without simulation data has grey fill', async ({ page }) => {
        const usaPath = page.locator(`path.country-path[data-country-id="${USA_ID}"]`);
        await expect(usaPath).toHaveAttribute('fill', INACTIVE_COLOR);
    });

    test('country without simulation data is not selectable', async ({ page }) => {
        const usaPath = page.locator(`path.country-path[data-country-id="${USA_ID}"]`);
        await expect(usaPath).not.toHaveAttribute('role');
        await expect(usaPath).not.toHaveAttribute('tabindex');
        await usaPath.click({ force: true });

        const sidebar = page.locator('.contextual-sidebar');
        await expect(sidebar).not.toBeVisible();
    });

    test('country with simulation data remains selectable', async ({ page }) => {
        const germanyPath = page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`);
        await expect(germanyPath).toHaveAttribute('role', 'button');
        await expect(germanyPath).toHaveAttribute('tabindex', '0');

        await germanyPath.click();

        const sidebar = page.locator('.contextual-sidebar');
        await expect(sidebar).toBeVisible();
    });

    test('country path has aria-label with country name', async ({ page }) => {
        const germanyPath = page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`);
        await expect(germanyPath).toHaveAttribute('aria-label', new RegExp(GERMANY.name));
    });

    test('country path aria-label includes funding progress', async ({ page }) => {
        const germanyPath = page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`);
        await expect(germanyPath).toHaveAttribute('aria-label', /90/);
    });

    test('SVG is responsive with 100% width and height', async ({ page }) => {
        const svg = page.locator('svg[width="100%"]');
        await expect(svg).toHaveAttribute('width', '100%');
        await expect(svg).toHaveAttribute('height', '100%');
    });

    test('SVG has viewBox attribute', async ({ page }) => {
        const svg = page.locator('svg[width="100%"]');
        await expect(svg).toHaveAttribute('viewBox');
    });

    test('scrolling the wheel over the map zooms it instead of scrolling the page', async ({
        page,
    }) => {
        const mapGroup = page.locator('.map-group');
        await expect(mapGroup).toHaveAttribute('transform', '');

        const svgBox = await page.locator('svg[width="100%"]').boundingBox();
        await page.mouse.move(svgBox!.x + svgBox!.width / 2, svgBox!.y + svgBox!.height / 2);
        await page.mouse.wheel(0, -300);

        await expect(mapGroup).not.toHaveAttribute('transform', '');
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test('dragging with the left mouse button pans the map without selecting a country', async ({
        page,
    }) => {
        const germanyPath = page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`);
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
        const svgBox = (await page.locator('svg[width="100%"]').boundingBox())!;
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
        const svgBox = (await page.locator('svg[width="100%"]').boundingBox())!;
        await page.mouse.move(svgBox.x + 50, svgBox.y + 50);
        await page.mouse.down({ button: 'left' });
        await page.mouse.move(svgBox.x + 200, svgBox.y + 150, { steps: 10 });
        await page.mouse.up({ button: 'left' });

        const germanyPath = page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`);
        await germanyPath.click();

        const mapGroup = page.locator('.map-group');
        const transform = await mapGroup.getAttribute('transform');
        expect(transform).toMatch(/translate\([^)]+\)\s+scale\(1\)$/);

        const match = transform!.match(/translate\(([^,]+),([^)]+)\)/);
        expect(match).not.toBeNull();
        const translateX = parseFloat(match![1]);
        const translateY = parseFloat(match![2]);
        expect(translateX).toBeCloseTo(112.5, 1);
        expect(translateY).toBeCloseTo(75, 1);

        await expect(germanyPath).toHaveCSS('stroke', toRGB(SELECTION_COLOR));
        await expect(germanyPath).toHaveCSS('stroke-opacity', '1');
        await expect(germanyPath).toHaveCSS('stroke-width', '0.5px');
    });
});
