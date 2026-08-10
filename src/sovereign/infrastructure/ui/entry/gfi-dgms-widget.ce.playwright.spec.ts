// Not using e2e/coverage-fixtures here: this page loads the pre-built dist bundle
// directly via a <script> tag, not the source-level instrumented module graph the
// other e2e/unit tests exercise. Instrumenting the production build to satisfy the
// coverage fixture makes vite-plugin-istanbul emit different statement positions
// than the dev-server instrumentation, which corrupts nyc's merge across the two
// (files shared with the SPA regress below 100%). This test verifies the built
// artifact behaves correctly; it isn't meant to contribute to source coverage.
import { expect, test } from '@playwright/test';

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
            const themeToggle = el.shadowRoot.querySelector('.theme-toggle');
            const themeIcon = el.shadowRoot.querySelector('.theme-toggle-icon svg');
            return {
                hasShadowRoot: true,
                hasMap: mapContainer !== null,
                // .map-container's scoped style sets position: relative (default is static);
                // this confirms the widget's CSS is actually applied inside the shadow root,
                // not just that the element exists.
                mapContainerPosition: mapContainer ? getComputedStyle(mapContainer).position : null,
                hasThemeToggle: themeToggle !== null,
                hasThemeIcon: themeIcon !== null,
            };
        });

        expect(shadowInfo).toEqual({
            hasShadowRoot: true,
            hasMap: true,
            mapContainerPosition: 'relative',
            hasThemeToggle: true,
            hasThemeIcon: true,
        });
    });
});
