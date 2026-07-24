import { Currency } from '@/shared/types/Currency';
import { describe, expect, it } from 'vitest';
import { Country, CountryId } from './Country';
import { InvestmentAmount } from './InvestmentAmount';
import { Simulation } from './Simulation';
import { TargetBudget } from './TargetBudget';

describe('Simulation', () => {
    const usd = Currency.USD();
    const targetBudget = new TargetBudget(1000, usd);
    const country = new Country(CountryId('DEU'), 'Germany', 500, targetBudget, 10, 5);

    describe('constructor', () => {
        it('creates a Simulation with country and investment', async () => {
            const investment = new InvestmentAmount(750, usd, 2000);
            const simulation = new Simulation(country, investment);

            expect(simulation.country).toBe(country);
            expect(simulation.investment).toBe(investment);
        });
    });

    describe('getResults()', () => {
        describe('fundingProgress', () => {
            it('returns 0.5 when investment is half the target', async () => {
                const investment = new InvestmentAmount(500, usd, 2000);
                const simulation = new Simulation(country, investment);

                const results = simulation.getResults();

                expect(results.fundingProgress).toBe(0.5);
            });
        });
    });
});
