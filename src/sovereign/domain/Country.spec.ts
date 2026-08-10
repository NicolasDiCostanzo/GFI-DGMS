import { describe, expect, it } from 'vitest';
import { Country, CountryId } from './Country';
import { TargetBudget } from './TargetBudget';

describe('Country', () => {
    const targetBudget = new TargetBudget(1000);
    const country = new Country(CountryId('276'), 'Germany', 500, targetBudget, 10, 5, 10000, 5000);

    describe('constructor', () => {
        it('creates a Country with all properties', () => {
            expect(country.id).toBe('276');
            expect(country.name).toBe('Germany');
            expect(country.baselineInvestment).toBe(500);
            expect(country.targetBudget).toBe(targetBudget);
            expect(country.jobMultiplier).toBe(10);
            expect(country.co2Multiplier).toBe(5);
            expect(country.currentNumberOfJobs).toBe(10000);
            expect(country.currentCO2Saved).toBe(5000);
        });
    });
});
