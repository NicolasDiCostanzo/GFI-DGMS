import { describe, expect, it } from 'vitest';
import {
    getFundingInstrumentDisplay,
    getFundingInstrumentLegend,
} from './FundingInstrumentDisplay';

describe('FundingInstrumentDisplay', () => {
    describe('getFundingInstrumentDisplay()', () => {
        it.each([null, undefined])('returns Other / Not specified for %p', (instrument) => {
            expect(getFundingInstrumentDisplay(instrument, 'dark')).toEqual({
                family: 'Other',
                label: 'Not specified',
                color: '#bdbdbd',
            });
        });

        it.each([
            ['Research Grant', 'Research', 'Research Grant'],
            ['Bilateral Research Grant', 'Research', 'Bilateral Research Grant'],
            ['Consortium', 'Research', 'Consortium'],
            ['Open Call', 'Research', 'Open Call'],
            ['Business Grant', 'Business', 'Business Grant'],
            ['Professional Services', 'Business', 'Professional Services'],
            ['Demonstration project', 'Business', 'Demonstration project'],
            ['Workforce & Education', 'Business', 'Workforce & Education'],
            ['Product Development', 'Business', 'Product Development'],
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
            ['Financing', 'Infrastructure', 'Financing'],
            ['Just Transition', 'Infrastructure', 'Just Transition'],
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
                color: '#bdbdbd',
            });
        });

        it.each([
            ['Research', 'Research Grant', '#1565c0', '#64b5f6'],
            ['Business', 'Business Grant', '#2e7d32', '#81c784'],
            ['Debt', 'Loan', '#c62828', '#ef5350'],
            ['Equity', 'Investment', '#6a1b9a', '#ba68c8'],
            ['Infrastructure', 'Facility Construction', '#00796b', '#26a69a'],
            ['Other', 'Other', '#616161', '#bdbdbd'],
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
                darkMode ? '#64b5f6' : '#1565c0',
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
                '#64b5f6',
                '#81c784',
                '#ef5350',
                '#ba68c8',
                '#26a69a',
                '#bdbdbd',
            ]);
        });
    });
});
