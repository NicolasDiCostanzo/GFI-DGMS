import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { GERMANY } from '@/sovereign/infrastructure/ui/components/InteractiveMap.spec.fixture';
import { describe, expect, it } from 'vitest';
import { MapColors } from '../domain/constants/MapColors';
import { Country, CountryId } from '../domain/Country';
import { CountryRepository } from '../domain/repository/CountryRepository';
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
    const germany = GERMANY;

    describe('execute()', () => {
        it('returns SimulationResults for a valid country and investment', async () => {
            const repository = new MockCountryRepository(germany);
            const useCase = new CalculateSimulationYields(repository);

            const results = await useCase.execute('276', 750);

            expect(results.fundingProgress).toBe(0.75);
            expect(results.additionalJobs).toBe(2500);
            expect(results.additionalCO2Tonnes).toBe(1250);
            expect(results.isOverTarget).toBe(false);
            expect(results.colorHex).toBe(MapColors.ORANGE);
        });

        it('throws CountryNotFoundError when country does not exist', async () => {
            const repository = new MockCountryRepository(null);
            const useCase = new CalculateSimulationYields(repository);

            await expect(useCase.execute('250', 500)).rejects.toThrow(CountryNotFoundError);
        });

        it('throws CountryNotFoundError with the requested country ID', async () => {
            const repository = new MockCountryRepository(null);
            const useCase = new CalculateSimulationYields(repository);

            expect.assertions(2);

            try {
                await useCase.execute('250', 500);
            } catch (error) {
                expect(error).toBeInstanceOf(CountryNotFoundError);
                expect((error as CountryNotFoundError).message).toContain('250');
            }
        });

        it('throws InvalidInvestmentError when investment exceeds max allowed', async () => {
            const repository = new MockCountryRepository(germany);
            const useCase = new CalculateSimulationYields(repository);

            await expect(useCase.execute('276', 2500)).rejects.toThrow(InvalidInvestmentError);
        });

        it('throws InvalidInvestmentError with a descriptive reason', async () => {
            const repository = new MockCountryRepository(germany);
            const useCase = new CalculateSimulationYields(repository);

            expect.assertions(2);

            try {
                await useCase.execute('276', 2500);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidInvestmentError);
                expect((error as InvalidInvestmentError).message).toContain(
                    'Investment 2500 exceeds maximum allowed 2000 for country 276',
                );
            }
        });

        it('returns isOverTarget true when investment exceeds target', async () => {
            const repository = new MockCountryRepository(germany);
            const useCase = new CalculateSimulationYields(repository);

            const results = await useCase.execute('276', 1500);

            expect(results.fundingProgress).toBe(1.5);
            expect(results.isOverTarget).toBe(true);
            expect(results.colorHex).toBe(MapColors.NEON_GREEN);
        });

        it('returns fundingProgress capped at 2.0 when investment is double the target', async () => {
            const repository = new MockCountryRepository(germany);
            const useCase = new CalculateSimulationYields(repository);

            const results = await useCase.execute('276', 2000);

            expect(results.fundingProgress).toBe(2.0);
            expect(results.isOverTarget).toBe(true);
            expect(results.colorHex).toBe(MapColors.NEON_GREEN);
        });

        it('re-throws errors from InvestmentAmount other than exceeding maxAllowed', async () => {
            const repository = new MockCountryRepository(germany);
            const useCase = new CalculateSimulationYields(repository);

            await expect(useCase.execute('276', Infinity)).rejects.toThrow(InfiniteNumberException);
        });
    });
});
