import { expect, test } from '@/../e2e/coverage-fixtures';

test.describe('gfi-dgms-widget custom element (embed-test.html)', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/embed-test.html');
    });

    test('renders as a custom element with an encapsulated shadow root', async ({ page }) => {
        const widget = page.locator('gfi-dgms-widget');
        await expect(widget).toBeVisible();

        const shadowInfo = await page.evaluate(() => {
            const el = document.querySelector('gfi-dgms-widget');
            if (!el || !el.shadowRoot) {
                return null;
            }
            const mapContainer = el.shadowRoot.querySelector('.map-container');
            return {
                hasShadowRoot: true,
                hasMap: mapContainer !== null,
                // .map-container's scoped style sets position: relative (default is static);
                // this confirms the widget's CSS is actually applied inside the shadow root,
                // not just that the element exists.
                mapContainerPosition: mapContainer ? getComputedStyle(mapContainer).position : null,
            };
        });

        expect(shadowInfo).toEqual({
            hasShadowRoot: true,
            hasMap: true,
            mapContainerPosition: 'relative',
        });
    });
});
