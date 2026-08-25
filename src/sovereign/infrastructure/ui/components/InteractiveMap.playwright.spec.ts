import { expect, test } from '@/../e2e/coverage-fixtures';
import { MOCK_GRANT_RECORDS } from '@/sovereign/infrastructure/ui/components/InteractiveMap.playwright.spec.fixtures';
import { MapColors } from '@/sovereign/infrastructure/ui/constants/MapColors';
import { DARK_THEME_COLORS } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { toRGB } from '@/sovereign/infrastructure/ui/constants/ThemePrimitives';
import { checkA11y, injectAxe } from 'axe-playwright';

const GERMANY_ID = '276';
const BORDER_COLOR = DARK_THEME_COLORS.BORDER;
const SELECTION_COLOR = MapColors.BLUE;

// Mirrors InteractiveMap's own screen-to-user-space conversion (getScreenCTM().inverse()),
// so a screen-space drag delta can be checked against the real, non-identity CTM the
// browser computes for this SVG's actual rendered size - something happy-dom can't provide.
async function toUserSpaceDelta(
    page: import('@playwright/test').Page,
    delta: { dx: number; dy: number },
): Promise<{ x: number; y: number }> {
    return page.evaluate(({ dx, dy }) => {
        const svg = document.querySelector('svg[width="100%"]') as SVGSVGElement;
        const inverse = svg.getScreenCTM()!.inverse();
        return { x: dx * inverse.a + dy * inverse.c, y: dx * inverse.b + dy * inverse.d };
    }, delta);
}

test.describe('InteractiveMap', () => {
    test.beforeEach(async ({ page }) => {
        await page.route('https://cdn.jsdelivr.net/gh/**/grants.json', async (route) => {
            await route.fulfill({ json: MOCK_GRANT_RECORDS });
        });
        await page.goto('/');
    });

    test('mounts as a standalone app with no shadow-DOM encapsulation', async ({ page }) => {
        const hasWidget = await page.evaluate(
            () => document.querySelector('gfi-dgms-widget') !== null,
        );
        expect(hasWidget).toBe(false);

        const appRoot = page.locator('#app');
        await expect(appRoot).toBeVisible();
    });

    test('has no detectable accessibility violations on initial load', async ({ page }) => {
        await injectAxe(page);
        await checkA11y(page);
    });

    test('country paths have the theme border stroke', async ({ page }) => {
        const firstPath = page.locator('path.country-path').first();
        await expect(firstPath).toHaveAttribute('stroke', BORDER_COLOR);
        await expect(firstPath).toHaveCSS('stroke-opacity', '0.35');
    });

    test('country paths have color transition on fill', async ({ page }) => {
        const germanyPath = page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`);
        await expect(germanyPath).toHaveCSS('transition', /fill 0\.3s/);
    });

    test('country path has cursor pointer on hover', async ({ page }) => {
        const germanyPath = page.locator(`path.country-path[data-country-id="${GERMANY_ID}"]`);
        await expect(germanyPath).toHaveCSS('cursor', 'pointer');
    });

    test('SVG is responsive with 100% width and height', async ({ page }) => {
        const svg = page.locator('svg[width="100%"]');
        await expect(svg).toHaveAttribute('width', '100%');
        await expect(svg).toHaveAttribute('height', '100%');
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
        const dx = 150;
        const dy = 80;

        await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
        await page.mouse.down({ button: 'left' });
        await page.mouse.move(box.x + box.width / 2 + dx, box.y + box.height / 2 + dy, {
            steps: 15,
        });
        await page.mouse.up({ button: 'left' });

        const expected = await toUserSpaceDelta(page, { dx, dy });
        const mapGroup = page.locator('.map-group');
        const transform = await mapGroup.getAttribute('transform');
        const match = transform!.match(/translate\(([^,]+),([^)]+)\)\s+scale\(1\)$/);
        expect(match).not.toBeNull();
        expect(parseFloat(match![1])).toBeCloseTo(expected.x, 1);
        expect(parseFloat(match![2])).toBeCloseTo(expected.y, 1);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
    });

    test('dragging with the middle mouse button pans the map', async ({ page }) => {
        const svgBox = (await page.locator('svg[width="100%"]').boundingBox())!;
        const centerX = svgBox.x + svgBox.width / 2;
        const centerY = svgBox.y + svgBox.height / 2;
        const dx = -100;
        const dy = -60;

        await page.mouse.move(centerX, centerY);
        await page.mouse.down({ button: 'middle' });
        await page.mouse.move(centerX + dx, centerY + dy, { steps: 15 });
        await page.mouse.up({ button: 'middle' });

        const expected = await toUserSpaceDelta(page, { dx, dy });
        const mapGroup = page.locator('.map-group');
        const transform = await mapGroup.getAttribute('transform');
        const match = transform!.match(/translate\(([^,]+),([^)]+)\)\s+scale\(1\)$/);
        expect(match).not.toBeNull();
        expect(parseFloat(match![1])).toBeCloseTo(expected.x, 1);
        expect(parseFloat(match![2])).toBeCloseTo(expected.y, 1);
        expect(await page.evaluate(() => window.scrollY)).toBe(0);
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
        expect(translateX).toBeCloseTo(104.15, 1);
        expect(translateY).toBeCloseTo(69.4, 1);

        await expect(germanyPath).toHaveCSS('stroke', toRGB(SELECTION_COLOR));
        await expect(germanyPath).toHaveCSS('stroke-opacity', '1');
        await expect(germanyPath).toHaveCSS('stroke-width', '0.5px');
    });

    test('the first real Tab key press lands on a focusable country, and Enter opens its sidebar', async ({
        page,
    }) => {
        await page.keyboard.press('Tab');

        const focused = page.locator(':focus');
        await expect(focused).toHaveAttribute('role', 'button');
        await expect(focused).toHaveClass(/\bclickable\b/);
        await expect(focused).toHaveCSS('outline-style', 'solid');
        await expect(focused).toHaveCSS('outline-width', '2px');
        await expect(focused).not.toHaveCSS('outline-color', 'transparent');
        const countryId = await focused.getAttribute('data-country-id');

        await page.keyboard.press('Enter');

        await expect(page.locator('.country-funding-panel')).toBeVisible();
        await expect(focused).toHaveCSS('stroke', toRGB(SELECTION_COLOR));
        await expect(focused).toHaveAttribute('data-country-id', countryId!);
    });
});
