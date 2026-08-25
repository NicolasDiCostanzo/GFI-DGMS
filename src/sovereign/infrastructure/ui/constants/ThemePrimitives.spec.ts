import { describe, expect, it } from 'vitest';
import { isDarkTheme, toRGB, toRgba } from './ThemePrimitives';
import { IS_DARK_THEME_CASES, TO_RGBA_CASES, TO_RGB_CASES } from './ThemePrimitives.spec.fixtures';

describe('ThemePrimitives', () => {
    describe('toRGB()', () => {
        it.each(TO_RGB_CASES)('converts %s to %s', (hex, expected) => {
            expect(toRGB(hex)).toBe(expected);
        });
    });

    describe('toRgba()', () => {
        it.each(TO_RGBA_CASES)('converts %s with alpha %d to %s', (hex, alpha, expected) => {
            expect(toRgba(hex, alpha)).toBe(expected);
        });
    });

    describe('isDarkTheme()', () => {
        it.each(IS_DARK_THEME_CASES.map(([mode, expected]) => ({ mode, expected })))(
            'returns $expected for mode $mode',
            ({ mode, expected }) => {
                expect(isDarkTheme(mode)).toBe(expected);
            },
        );
    });
});
