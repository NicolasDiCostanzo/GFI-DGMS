import { describe, expect, it } from 'vitest';
import { getThemeColors } from './ThemeColors';
import { THEME_MODES } from './ThemeColors.spec.fixtures';

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

        it.each(THEME_MODES)(
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
    });
});
