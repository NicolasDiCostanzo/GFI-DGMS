import { describe, expect, it } from 'vitest';
import { getAimDisplay } from './AimDisplay';

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

        it.each([
            ['Research & Development', '#1565c0', 'rgba(21, 101, 192, 0.08)', '#1565c0'],
            ['Commercialization', '#2e7d32', 'rgba(46, 125, 50, 0.08)', '#2e7d32'],
            ['Mixed', '#f57f17', 'rgba(245, 127, 23, 0.08)', '#f57f17'],
        ] as const)(
            'uses the light palette for %s in light mode',
            (aim, borderColor, backgroundColor, textColor) => {
                expect(getAimDisplay(aim, 'light')).toEqual({
                    label: expect.any(String) as unknown as string,
                    shortLabel: expect.any(String) as unknown as string,
                    borderColor,
                    backgroundColor,
                    textColor,
                });
            },
        );

        it.each([
            ['Research & Development', '#64b5f6', 'rgba(100, 181, 246, 0.12)', '#64b5f6'],
            ['Commercialization', '#81c784', 'rgba(129, 199, 132, 0.12)', '#81c784'],
            ['Mixed', '#ffd54f', 'rgba(255, 213, 79, 0.12)', '#ffd54f'],
        ] as const)(
            'uses the dark palette for %s in dark mode',
            (aim, borderColor, backgroundColor, textColor) => {
                expect(getAimDisplay(aim, 'dark')).toEqual({
                    label: expect.any(String) as unknown as string,
                    shortLabel: expect.any(String) as unknown as string,
                    borderColor,
                    backgroundColor,
                    textColor,
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
                    const expectedBorder = darkMode
                        ? aim === 'Research & Development'
                            ? '#64b5f6'
                            : aim === 'Commercialization'
                              ? '#81c784'
                              : '#ffd54f'
                        : aim === 'Research & Development'
                          ? '#1565c0'
                          : aim === 'Commercialization'
                            ? '#2e7d32'
                            : '#f57f17';
                    expect(getAimDisplay(aim, themeMode)?.borderColor).toBe(expectedBorder);
                }
            },
        );
    });
});
