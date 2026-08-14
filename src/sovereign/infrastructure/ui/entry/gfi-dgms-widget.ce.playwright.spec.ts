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
