import { describe, expect, it } from 'vitest';
import {
    DARK_THEME_COLORS,
    getMetricGradientEndColor,
    getThemeColors,
    LIGHT_THEME_COLORS,
} from './ThemeColors';

describe('ThemeColors', () => {
    describe('getThemeColors()', () => {
        it('returns light theme colors for light and colorblind-light modes', () => {
            const lightColors = getThemeColors('light');
            const colorblindLightColors = getThemeColors('colorblind-light');
            expect(colorblindLightColors).toEqual(lightColors);
            expect(colorblindLightColors.OCEAN).toBe('#e8f4f8');
            expect(colorblindLightColors.BORDER).toBe('#000000');
            expect(colorblindLightColors.TOOLTIP_BG).toBe('rgba(0, 0, 0, 0.8)');
            expect(colorblindLightColors.SIDEBAR_BG).toBe('white');
        });

        it('returns dark theme colors for dark and colorblind-dark modes', () => {
            const darkColors = getThemeColors('dark');
            const colorblindDarkColors = getThemeColors('colorblind-dark');
            expect(colorblindDarkColors).toEqual(darkColors);
            expect(colorblindDarkColors.OCEAN).toBe('#1a2634');
            expect(colorblindDarkColors.BORDER).toBe('white');
            expect(colorblindDarkColors.TOOLTIP_BG).toBe('rgba(0, 0, 0, 0.9)');
            expect(colorblindDarkColors.SIDEBAR_BG).toBe('#121212');
        });

        it.each(['light', 'dark'] as const)(
            'returns an object with all required theme color keys for %s mode',
            (mode) => {
                const colors = getThemeColors(mode);
                expect(colors).toHaveProperty('OCEAN');
                expect(colors).toHaveProperty('INACTIVE');
                expect(colors).toHaveProperty('BORDER');
                expect(colors).toHaveProperty('TOOLTIP_BG');
                expect(colors).toHaveProperty('TOOLTIP_TEXT');
                expect(colors).toHaveProperty('LEGEND_BG');
                expect(colors).toHaveProperty('LEGEND_TEXT');
                expect(colors).toHaveProperty('ON_LINK');
            },
        );

        it('exposes the shared card, modal and panel chrome colors', () => {
            const expected = {
                CARD_SHADOW: 'rgba(127, 127, 127, 0.6)',
                ROW_SHADOW: 'rgba(127, 127, 127, 0.15)',
                MODAL_OVERLAY: 'rgba(0, 0, 0, 0.65)',
                MODAL_SHADOW: 'rgba(0, 0, 0, 0.5)',
                PANEL_BORDER: '#2a2a2a',
                PANEL_BORDER_STRONG: '#333333',
                HIGHLIGHT: '#1c92ff',
                HIGHLIGHT_BG: 'rgba(28, 146, 255, 0.1)',
                HIGHLIGHT_BORDER: 'rgba(28, 146, 255, 0.25)',
            } as const;
            expect(LIGHT_THEME_COLORS).toMatchObject(expected);
            expect(DARK_THEME_COLORS).toMatchObject(expected);
        });

        it('reuses the map palette primitives for identical theme values', () => {
            expect(LIGHT_THEME_COLORS.ACCENT).toBe('#2196f3');
            expect(DARK_THEME_COLORS.ACCENT).toBe('#2196f3');
            expect(LIGHT_THEME_COLORS.ERROR).toBe('#d32f2f');
        });
    });

    describe('getMetricGradientEndColor()', () => {
        it.each([
            ['#43a047', 'color-mix(in srgb, #43a047 80%, black)'],
            ['rgba(161, 102, 47, 1)', 'color-mix(in srgb, rgba(161, 102, 47, 1) 80%, black)'],
        ])('derives the darker gradient end stop from %s', (color, expected) => {
            expect(getMetricGradientEndColor(color)).toBe(expected);
        });
    });
});
