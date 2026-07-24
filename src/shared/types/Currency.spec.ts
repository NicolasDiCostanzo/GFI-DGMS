import { describe, expect, it } from 'vitest';
import { Currency, CurrencyCode } from './Currency';

describe('CurrencyCode', () => {
    it('defines USD and EUR currency codes', () => {
        expect(CurrencyCode.USD).toBe('USD');
        expect(CurrencyCode.EUR).toBe('EUR');
    });
});

describe('Currency', () => {
    describe('USD()', () => {
        it('returns a Currency with USD code, $ symbol, and 2 decimals', () => {
            const usd = Currency.USD();

            expect(usd.code).toBe(CurrencyCode.USD);
            expect(usd.symbol).toBe('$');
            expect(usd.decimals).toBe(2);
        });
    });

    describe('EUR()', () => {
        it('returns a Currency with EUR code, € symbol, and 2 decimals', () => {
            const eur = Currency.EUR();

            expect(eur.code).toBe(CurrencyCode.EUR);
            expect(eur.symbol).toBe('€');
            expect(eur.decimals).toBe(2);
        });
    });

    describe('format()', () => {
        it('formats a positive amount with USD', () => {
            const usd = Currency.USD();

            expect(usd.format(1234.56)).toBe('$1,234.56');
        });

        it('formats zero', () => {
            const usd = Currency.USD();

            expect(usd.format(0)).toBe('$0.00');
        });

        it('formats a large amount with grouping separators', () => {
            const usd = Currency.USD();

            expect(usd.format(1000000)).toBe('$1,000,000.00');
        });

        it('rounds to the specified number of decimals', () => {
            const usd = Currency.USD();

            expect(usd.format(999.999)).toBe('$1,000.00');
        });

        it('formats a negative amount', () => {
            const usd = Currency.USD();

            expect(usd.format(-50.25)).toBe('-$50.25');
        });

        it('formats with EUR symbol', () => {
            const eur = Currency.EUR();

            expect(eur.format(1234.56)).toBe('€1,234.56');
        });
    });
});
