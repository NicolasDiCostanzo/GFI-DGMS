import { describe, expect, it } from 'vitest';
import {
    getColorForFundingProgress,
    getFundingProgressColors,
    getThemeColors,
    toRGB,
} from './MapColors';
import {
    FUNDING_PROGRESS_COLOR_CASES,
    FUNDING_PROGRESS_COLORS_CASES,
    FUNDING_PROGRESS_MODE_CASES,
    THEME_MODES,
    TO_RGB_CASES,
} from './MapColors.spec.fixtures';

describe('MapColors', () => {
    describe('getColorForFundingProgress()', () => {
        it.each(FUNDING_PROGRESS_COLOR_CASES)('%s', (_title, fundingProgress, expected) => {
            expect(getColorForFundingProgress(fundingProgress)).toBe(expected);
        });
    });

    describe('toRGB', () => {
        it.each(TO_RGB_CASES)('converts %s to %s', (hex, expected) => {
            expect(toRGB(hex)).toBe(expected);
        });
    });

    describe('getThemeColors()', () => {
        it('returns light theme colors for light and colorblind-light modes', () => {
            const lightColors = getThemeColors('light');
            const colorblindLightColors = getThemeColors('colorblind-light');
            expect(colorblindLightColors).toEqual(lightColors);
            expect(colorblindLightColors.OCEAN).toBe('#e8f4f8');
            expect(colorblindLightColors.BORDER).toBe('#000000');
            expect(colorblindLightColors.TOOLTIP_BG).toBe('rgba(0, 0, 0, 0.8)');
        });

        it('returns dark theme colors for dark and colorblind-dark modes', () => {
            const darkColors = getThemeColors('dark');
            const colorblindDarkColors = getThemeColors('colorblind-dark');
            expect(colorblindDarkColors).toEqual(darkColors);
            expect(colorblindDarkColors.OCEAN).toBe('#1a2634');
            expect(colorblindDarkColors.BORDER).toBe('#ffffff');
            expect(colorblindDarkColors.TOOLTIP_BG).toBe('rgba(0, 0, 0, 0.9)');
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
            },
        );
    });

    describe('getFundingProgressColors()', () => {
        it.each(FUNDING_PROGRESS_COLORS_CASES)(
            'returns the correct palette for %s mode',
            (mode, expected) => {
                expect(getFundingProgressColors(mode)).toEqual(expected);
            },
        );
    });

    describe('getColorForFundingProgress() with theme mode', () => {
        it.each(FUNDING_PROGRESS_MODE_CASES)(
            'returns correct color for %s mode',
            (mode, expected) => {
                expect(getColorForFundingProgress(0.75, mode)).toBe(expected);
            },
        );
    });
});
