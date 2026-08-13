import { describe, expect, it } from 'vitest';
import { getAimDisplay } from './AimDisplay';
import { AIM_PALETTES } from './ThemeColors';

describe('AimDisplay', () => {
    describe('getAimDisplay()', () => {
        it.each([null, undefined])('returns null when aim is %p', (aim) => {
            expect(getAimDisplay(aim, 'dark')).toBeNull();
        });

        it('returns null for an unknown aim value', () => {
            expect(getAimDisplay('Unknown aim', 'dark')).toBeNull();
        });

        it.each([
            ['Research & Development', { label: 'Research & Development', shortLabel: 'R&D' }],
            ['Commercialization', { label: 'Commercialization', shortLabel: 'Comm.' }],
            ['Mixed', { label: 'Mixed', shortLabel: 'Mix' }],
        ] as const)('maps aim %s to its label and short label', (aim, expected) => {
            const display = getAimDisplay(aim, 'dark');

            expect(display).not.toBeNull();
            expect(display?.label).toBe(expected.label);
            expect(display?.shortLabel).toBe(expected.shortLabel);
        });

        it.each(Object.keys(AIM_PALETTES) as Array<keyof typeof AIM_PALETTES>)(
            'uses the light palette for %s in light mode',
            (aim) => {
                const palette = AIM_PALETTES[aim].light;
                expect(getAimDisplay(aim, 'light')).toEqual({
                    label: expect.any(String) as unknown as string,
                    shortLabel: expect.any(String) as unknown as string,
                    borderColor: palette.borderColor,
                    backgroundColor: palette.backgroundColor,
                    textColor: palette.textColor,
                });
            },
        );

        it.each(Object.keys(AIM_PALETTES) as Array<keyof typeof AIM_PALETTES>)(
            'uses the dark palette for %s in dark mode',
            (aim) => {
                const palette = AIM_PALETTES[aim].dark;
                expect(getAimDisplay(aim, 'dark')).toEqual({
                    label: expect.any(String) as unknown as string,
                    shortLabel: expect.any(String) as unknown as string,
                    borderColor: palette.borderColor,
                    backgroundColor: palette.backgroundColor,
                    textColor: palette.textColor,
                });
            },
        );

        it.each([
            ['dark', 'dark'],
            ['colorblind-dark', 'dark'],
            ['light', 'light'],
            ['colorblind-light', 'light'],
        ] as const)(
            'resolves the %s palette the same as %s for aiming',
            (themeMode, paletteFamily) => {
                for (const aim of [
                    'Research & Development',
                    'Commercialization',
                    'Mixed',
                ] as const) {
                    const darkMode = paletteFamily === 'dark';
                    const family = aim as keyof typeof AIM_PALETTES;
                    const expectedBorder = (
                        darkMode ? AIM_PALETTES[family].dark : AIM_PALETTES[family].light
                    ).borderColor;
                    expect(getAimDisplay(aim, themeMode)?.borderColor).toBe(expectedBorder);
                }
            },
        );
    });
});
