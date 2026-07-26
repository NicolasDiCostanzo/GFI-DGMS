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
});
