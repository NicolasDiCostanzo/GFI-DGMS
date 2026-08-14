import { describe, expect, it } from 'vitest';
import {
    getFundingInstrumentDisplay,
    getFundingInstrumentLegend,
} from './FundingInstrumentDisplay';
import { INSTRUMENT_FAMILY_COLORS } from './ThemeColors';

describe('FundingInstrumentDisplay', () => {
    describe('getFundingInstrumentDisplay()', () => {
        it.each([null, undefined])('returns Other / Not specified for %p', (instrument) => {
            expect(getFundingInstrumentDisplay(instrument, 'dark')).toEqual({
                family: 'Other',
                label: 'Not specified',
                color: INSTRUMENT_FAMILY_COLORS.Other.dark,
            });
        });

        it.each([
            ['Research Grant', 'Research', 'Research Grant'],
            ['Bilateral Research Grant', 'Research', 'Bilateral Research Grant'],
            ['Consortium', 'Research', 'Consortium'],
            ['Open Call', 'Research', 'Open Call'],
            ['[?] Open Call', 'Research', 'Open Call'],
            ['Business Grant', 'Business', 'Business Grant'],
            ['Professional Services', 'Business', 'Professional Services'],
            ['Demonstration project', 'Business', 'Demonstration project'],
            ['Workforce & Education', 'Business', 'Workforce & Education'],
            ['Product Development', 'Business', 'Product Development'],
            ['[?] Product Development', 'Business', 'Product Development'],
            ['Loan', 'Debt', 'Loan'],
            ['Loan Commitment', 'Debt', 'Loan Commitment'],
            ['Loan Guarantee', 'Debt', 'Loan Guarantee'],
            ['Subordinated Loan', 'Debt', 'Subordinated Loan'],
            ['Equity Funding', 'Equity', 'Equity Funding'],
            ['Investment', 'Equity', 'Investment'],
            ['Investment Fund', 'Equity', 'Investment Fund'],
            ['Facility Construction', 'Infrastructure', 'Facility Construction'],
            ['Subsidies', 'Infrastructure', 'Subsidies'],
            ['Commitment', 'Infrastructure', 'Commitment'],
            ['[?] Commitment', 'Infrastructure', 'Commitment'],
            ['Financing', 'Infrastructure', 'Financing'],
            ['[?] Financing', 'Infrastructure', 'Financing'],
            ['Just Transition', 'Infrastructure', 'Just Transition'],
            ['[?] Just Transition', 'Infrastructure', 'Just Transition'],
            ['MIXED', 'Other', 'Mixed'],
            ['Other', 'Other', 'Other'],
        ] as const)('maps %s to family %s and label %s', (instrument, family, label) => {
            expect(getFundingInstrumentDisplay(instrument, 'dark')).toEqual({
                family,
                label,
                color: expect.any(String),
            });
        });

        it('falls back to Other with the raw value for an unknown instrument', () => {
            expect(getFundingInstrumentDisplay('Something new', 'dark')).toEqual({
                family: 'Other',
                label: 'Something new',
                color: INSTRUMENT_FAMILY_COLORS.Other.dark,
            });
        });

        it.each([
            [
                'Research',
                'Research Grant',
                INSTRUMENT_FAMILY_COLORS.Research.light,
                INSTRUMENT_FAMILY_COLORS.Research.dark,
            ],
            [
                'Business',
                'Business Grant',
                INSTRUMENT_FAMILY_COLORS.Business.light,
                INSTRUMENT_FAMILY_COLORS.Business.dark,
            ],
            [
                'Debt',
                'Loan',
                INSTRUMENT_FAMILY_COLORS.Debt.light,
                INSTRUMENT_FAMILY_COLORS.Debt.dark,
            ],
            [
                'Equity',
                'Investment',
                INSTRUMENT_FAMILY_COLORS.Equity.light,
                INSTRUMENT_FAMILY_COLORS.Equity.dark,
            ],
            [
                'Infrastructure',
                'Facility Construction',
                INSTRUMENT_FAMILY_COLORS.Infrastructure.light,
                INSTRUMENT_FAMILY_COLORS.Infrastructure.dark,
            ],
            [
                'Other',
                'Other',
                INSTRUMENT_FAMILY_COLORS.Other.light,
                INSTRUMENT_FAMILY_COLORS.Other.dark,
            ],
        ] as const)(
            'uses the %s family color for light and dark',
            (_family, instrument, lightColor, darkColor) => {
                expect(getFundingInstrumentDisplay(instrument, 'light').color).toBe(lightColor);
                expect(getFundingInstrumentDisplay(instrument, 'dark').color).toBe(darkColor);
            },
        );

        it.each([
            ['dark', 'dark'],
            ['colorblind-dark', 'dark'],
            ['light', 'light'],
            ['colorblind-light', 'light'],
        ] as const)('resolves the %s palette the same as %s', (themeMode, paletteFamily) => {
            const darkMode = paletteFamily === 'dark';
            expect(getFundingInstrumentDisplay('Research Grant', themeMode).color).toBe(
                darkMode
                    ? INSTRUMENT_FAMILY_COLORS.Research.dark
                    : INSTRUMENT_FAMILY_COLORS.Research.light,
            );
        });
    });

    describe('getFundingInstrumentLegend()', () => {
        it('returns all six families', () => {
            expect(getFundingInstrumentLegend('dark').map((f) => f.family)).toEqual([
                'Research',
                'Business',
                'Debt',
                'Equity',
                'Infrastructure',
                'Other',
            ]);
        });

        it('returns the dark color for each family in dark mode', () => {
            const legend = getFundingInstrumentLegend('dark');
            expect(legend.map((f) => f.color)).toEqual([
                INSTRUMENT_FAMILY_COLORS.Research.dark,
                INSTRUMENT_FAMILY_COLORS.Business.dark,
                INSTRUMENT_FAMILY_COLORS.Debt.dark,
                INSTRUMENT_FAMILY_COLORS.Equity.dark,
                INSTRUMENT_FAMILY_COLORS.Infrastructure.dark,
                INSTRUMENT_FAMILY_COLORS.Other.dark,
            ]);
        });

        it('returns the light color for each family in light mode', () => {
            const legend = getFundingInstrumentLegend('light');
            expect(legend.map((f) => f.color)).toEqual([
                INSTRUMENT_FAMILY_COLORS.Research.light,
                INSTRUMENT_FAMILY_COLORS.Business.light,
                INSTRUMENT_FAMILY_COLORS.Debt.light,
                INSTRUMENT_FAMILY_COLORS.Equity.light,
                INSTRUMENT_FAMILY_COLORS.Infrastructure.light,
                INSTRUMENT_FAMILY_COLORS.Other.light,
            ]);
        });
    });
});
