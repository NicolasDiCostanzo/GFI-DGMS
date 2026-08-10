import { expect, test } from '@/../e2e/coverage-fixtures';
import { DARK_THEME_COLORS, MapColors, toRGB } from '@/sovereign/domain/constants/MapColors';
import { CountryId } from '@/sovereign/domain/Country';

const GERMANY_ID = CountryId('276');
const BORDER_COLOR = DARK_THEME_COLORS.BORDER;
const SELECTION_COLOR = MapColors.SELECTION;

test.describe('InteractiveMap', () => {
    test.beforeEach(async ({ page }) => {
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

    test('country paths have black border stroke', async ({ page }) => {
        const firstPath = page.locator('path.country-path').first();
        await expect(firstPath).toHaveCSS('stroke', toRGB(BORDER_COLOR));
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
        expect(translateX).toBeCloseTo(112.5, 1);
        expect(translateY).toBeCloseTo(75, 1);

        await expect(germanyPath).toHaveCSS('stroke', toRGB(SELECTION_COLOR));
        await expect(germanyPath).toHaveCSS('stroke-opacity', '1');
        await expect(germanyPath).toHaveCSS('stroke-width', '0.5px');
    });

    test('the first real Tab key press lands on a focusable country, and Enter opens its sidebar', async ({
        page,
    }) => {
        // The unit spec only simulates focus/keydown directly on a chosen element
        // (wrapper.trigger('focus')/'keydown.enter'), which proves the component
        // reacts correctly to those events but never proves a real Tab key press
        // actually reaches that element in the browser's computed tab order. Only a
        // real browser can verify that, which is what this test is for: every
        // country path has click/keydown listeners (needed so the "no data" ones
        // stay clickable), and some browsers include listener-bearing elements in
        // the default tab sequence even without a tabindex attribute — so
        // non-selectable countries must be explicitly excluded with tabindex="-1"
        // (see InteractiveMap.vue), not just left without a tabindex.
        await page.keyboard.press('Tab');

        const focused = page.locator(':focus');
        await expect(focused).toHaveAttribute('role', 'button');
        await expect(focused).toHaveClass(/\bclickable\b/);
        const countryId = await focused.getAttribute('data-country-id');

        await page.keyboard.press('Enter');

        await expect(page.locator('.contextual-sidebar')).toBeVisible();
        await expect(focused).toHaveCSS('stroke', toRGB(SELECTION_COLOR));
        await expect(focused).toHaveAttribute('data-country-id', countryId!);
    });
});
