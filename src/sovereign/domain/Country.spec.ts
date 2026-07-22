import { Currency } from '@/shared/types/Currency';
import { describe, expect, it } from 'vitest';
import { Country, CountryId } from './Country';
import { TargetBudget } from './TargetBudget';

describe('Country', () => {
    const targetBudget = new TargetBudget(1000, Currency.USD());
    const country = new Country(CountryId('DEU'), 'Germany', 500, targetBudget, 10, 5);

    describe('constructor', () => {
        it('creates a Country with all properties', () => {
            expect(country.id).toBe('DEU');
            expect(country.name).toBe('Germany');
            expect(country.baselineInvestment).toBe(500);
            expect(country.targetBudget).toBe(targetBudget);
            expect(country.jobMultiplier).toBe(10);
            expect(country.co2Multiplier).toBe(5);
        });
    });

    describe('getFundingProgress()', () => {
        it('returns 0 when investment is zero', () => {
            expect(country.getFundingProgress(0)).toBe(0);
        });

        it('returns 1.0 when investment equals target', () => {
            expect(country.getFundingProgress(1000)).toBe(1);
        });

        it('returns 2.0 when investment is double the target', () => {
            expect(country.getFundingProgress(2000)).toBe(2);
        });
    });

    describe('getAdditionalJobs()', () => {
        it('returns 0 when investment equals baseline', () => {
            expect(country.getAdditionalJobs(500)).toBe(0);
        });

        it('returns positive when investment exceeds baseline', () => {
            expect(country.getAdditionalJobs(1000)).toBe(5000);
        });

        it('returns negative when investment is below baseline', () => {
            expect(country.getAdditionalJobs(250)).toBe(-2500);
        });
    });

    describe('getAdditionalCO2Saved()', () => {
        it('returns 0 when investment equals baseline', () => {
            expect(country.getAdditionalCO2Saved(500)).toBe(0);
        });

        it('returns positive when investment exceeds baseline', () => {
            expect(country.getAdditionalCO2Saved(1000)).toBe(2500);
        });

        it('returns negative when investment is below baseline', () => {
            expect(country.getAdditionalCO2Saved(250)).toBe(-1250);
        });
    });
});
