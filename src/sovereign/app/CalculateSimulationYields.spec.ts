import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { Currency } from '@/shared/types/Currency';
import { describe, expect, it } from 'vitest';
import { MapColors } from '../domain/constants/MapColors';
import { Country, CountryId } from '../domain/Country';
import { CountryRepository } from '../domain/repository/CountryRepository';
import { TargetBudget } from '../domain/TargetBudget';
import { CalculateSimulationYields } from './CalculateSimulationYields';
import { CountryNotFoundError } from './errors/CountryNotFoundError';
import { InvalidInvestmentError } from './errors/InvalidInvestmentError';

class MockCountryRepository implements CountryRepository {
    constructor(private country: Country | null) {}

    findById(_id: CountryId): Promise<Country | null> {
        return Promise.resolve(this.country);
    }

    findAll(): Promise<Country[]> {
        return Promise.resolve(this.country ? [this.country] : []);
    }
}

describe('CalculateSimulationYields', () => {
    const usd = Currency.USD();
    const targetBudget = new TargetBudget(1000, usd);
    const germany = new Country(CountryId('DEU'), 'Germany', 500, targetBudget, 10, 5);

    describe('execute()', () => {
        it('returns SimulationResults for a valid country and investment', async () => {
            const repository = new MockCountryRepository(germany);
            const useCase = new CalculateSimulationYields(repository);

            const results = await useCase.execute('DEU', 750);

            expect(results.fundingProgress).toBe(0.75);
            expect(results.additionalJobs).toBe(2500);
            expect(results.additionalCO2Tonnes).toBe(1250);
            expect(results.isOverTarget).toBe(false);
            expect(results.colorHex).toBe(MapColors.ORANGE);
        });

        it('throws CountryNotFoundError when country does not exist', async () => {
            const repository = new MockCountryRepository(null);
            const useCase = new CalculateSimulationYields(repository);

            await expect(useCase.execute('FRA', 500)).rejects.toThrow(CountryNotFoundError);
        });

        it('throws CountryNotFoundError with the requested country ID', async () => {
            const repository = new MockCountryRepository(null);
            const useCase = new CalculateSimulationYields(repository);

            await expect(useCase.execute('FRA', 500)).rejects.toThrow(
                'Country with ID FRA not found',
            );
        });

        it('throws InvalidInvestmentError when investment exceeds max allowed', async () => {
            const repository = new MockCountryRepository(germany);
            const useCase = new CalculateSimulationYields(repository);

            await expect(useCase.execute('DEU', 2500)).rejects.toThrow(InvalidInvestmentError);
        });

        it('throws InvalidInvestmentError with a descriptive reason', async () => {
            const repository = new MockCountryRepository(germany);
            const useCase = new CalculateSimulationYields(repository);

            await expect(useCase.execute('DEU', 2500)).rejects.toThrow(
                'Investment 2500 exceeds maximum allowed 2000 for country DEU',
            );
        });

        it('returns isOverTarget true when investment exceeds target', async () => {
            const repository = new MockCountryRepository(germany);
            const useCase = new CalculateSimulationYields(repository);

            const results = await useCase.execute('DEU', 1500);

            expect(results.fundingProgress).toBe(1.5);
            expect(results.isOverTarget).toBe(true);
            expect(results.colorHex).toBe(MapColors.NEON_GREEN);
        });

        it('returns fundingProgress capped at 2.0 when investment is double the target', async () => {
            const repository = new MockCountryRepository(germany);
            const useCase = new CalculateSimulationYields(repository);

            const results = await useCase.execute('DEU', 2000);

            expect(results.fundingProgress).toBe(2.0);
            expect(results.isOverTarget).toBe(true);
            expect(results.colorHex).toBe(MapColors.NEON_GREEN);
        });

        it('re-throws non-InvalidNumberException errors from InvestmentAmount', async () => {
            const repository = new MockCountryRepository(germany);
            const useCase = new CalculateSimulationYields(repository);

            await expect(useCase.execute('DEU', Infinity)).rejects.toThrow(InfiniteNumberException);
        });
    });
});
