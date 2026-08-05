import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { Currency } from '@/shared/types/Currency';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Country, CountryId } from '../../domain/Country';
import countriesData from '../data/countries.json';
import { CountryDataValidationError } from '../errors/CountryDataValidationError';
import { StaticCountryRepository, type CountryRecord } from './StaticCountryRepository';

describe('StaticCountryRepository', () => {
    describe('constructor', () => {
        it('throws when data is an empty array', () => {
            expect(() => new StaticCountryRepository([])).toThrow(Error);
        });

        it('constructs successfully with valid data', () => {
            const repository = new StaticCountryRepository(countriesData as CountryRecord[]);

            expect(repository).toBeInstanceOf(StaticCountryRepository);
        });

        it('constructs successfully with no arguments using default data', () => {
            const repository = new StaticCountryRepository();

            expect(repository).toBeInstanceOf(StaticCountryRepository);
        });

        it('throws CountryDataValidationError when id is missing', () => {
            const invalidData = [
                {
                    id: '',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                CountryDataValidationError,
            );
        });

        it('throws CountryDataValidationError when id is not a string', () => {
            const invalidData = [
                {
                    id: 123,
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as unknown as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                CountryDataValidationError,
            );
        });

        it('throws CountryDataValidationError when name is missing', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: '',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                CountryDataValidationError,
            );
        });

        it('throws CountryDataValidationError when name is not a string', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 456,
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as unknown as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                CountryDataValidationError,
            );
        });

        it('throws CountryDataValidationError when baselineInvestment is not a number', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 'invalid',
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as unknown as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                CountryDataValidationError,
            );
        });

        it('throws InfiniteNumberException when baselineInvestment is not finite', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: Infinity,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(InfiniteNumberException);
        });

        it('throws NonPositiveNumberException when targetBudget is not positive', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: -50,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                NonPositiveNumberException,
            );
        });

        it('throws NonPositiveNumberException when targetBudget is zero', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 0,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                NonPositiveNumberException,
            );
        });

        it('throws CountryDataValidationError when targetBudget is not a number', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 'invalid',
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as unknown as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                CountryDataValidationError,
            );
        });

        it('throws InvalidNumberException when targetBudget is NaN', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: NaN,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(InvalidNumberException);
        });

        it('throws CountryDataValidationError when currency is invalid', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'GBP',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as unknown as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                CountryDataValidationError,
            );
        });

        it('throws CountryDataValidationError when jobMultiplier is not a number', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 'invalid',
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as unknown as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                CountryDataValidationError,
            );
        });

        it('throws InfiniteNumberException when jobMultiplier is not finite', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: Infinity,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(InfiniteNumberException);
        });

        it('throws CountryDataValidationError when co2Multiplier is not a number', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 'invalid',
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as unknown as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                CountryDataValidationError,
            );
        });

        it('throws InvalidNumberException when co2Multiplier is NaN', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: NaN,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(InvalidNumberException);
        });

        it('throws CountryDataValidationError when currentNumberOfJobs is not a number', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 'invalid',
                    currentCO2Saved: 100,
                },
            ] as unknown as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                CountryDataValidationError,
            );
        });

        it('throws InvalidNumberException when currentNumberOfJobs is NaN', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: NaN,
                    currentCO2Saved: 100,
                },
            ] as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(InvalidNumberException);
        });

        it('throws InfiniteNumberException when currentNumberOfJobs is Infinity', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: Infinity,
                    currentCO2Saved: 100,
                },
            ] as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(InfiniteNumberException);
        });

        it('throws CountryDataValidationError when currentCO2Saved is not a number', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 'invalid',
                },
            ] as unknown as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(
                CountryDataValidationError,
            );
        });

        it('throws InvalidNumberException when currentCO2Saved is NaN', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: NaN,
                },
            ] as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(InvalidNumberException);
        });

        it('throws InfiniteNumberException when currentCO2Saved is Infinity', () => {
            const invalidData = [
                {
                    id: 'TST',
                    name: 'Test Country',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: Infinity,
                },
            ] as CountryRecord[];

            expect(() => new StaticCountryRepository(invalidData)).toThrow(InfiniteNumberException);
        });

        it('identifies the invalid record index in error message', () => {
            const invalidData = [
                {
                    id: 'TST1',
                    name: 'Test Country 1',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
                {
                    id: '',
                    name: 'Test Country 2',
                    baselineInvestment: 100,
                    targetBudget: 200,
                    currency: 'USD',
                    jobMultiplier: 5,
                    co2Multiplier: 3,
                    currentNumberOfJobs: 100,
                    currentCO2Saved: 50,
                },
            ] as CountryRecord[];

            expect.assertions(2);

            try {
                new StaticCountryRepository(invalidData);
            } catch (error) {
                expect(error).toBeInstanceOf(CountryDataValidationError);
                expect((error as CountryDataValidationError).message).toContain(
                    'Invalid country record at index 2',
                );
            }
        });
    });

    describe('with valid data', () => {
        let repository: StaticCountryRepository;

        beforeAll(() => {
            repository = new StaticCountryRepository(countriesData as CountryRecord[]);
        });

        describe('findById()', () => {
            it('returns the country for a known ID', async () => {
                const country = await repository.findById(CountryId('276'));

                expect(country).toBeInstanceOf(Country);
                expect(country).not.toBeNull();

                if (country === null) {
                    throw new Error('Country should not be null');
                }

                expect(country.id).toBe('276');
                expect(country.name).toBe('Germany');
                expect(country.baselineInvestment).toBe(900);
                expect(country.targetBudget.amount).toBe(1000);
                expect(country.targetBudget.currency).toEqual(Currency.USD());
                expect(country.jobMultiplier).toBe(10);
                expect(country.co2Multiplier).toBe(5);
            });

            it('returns null for an unknown ID', async () => {
                const country = await repository.findById(CountryId('ZZZ'));

                expect(country).toBeNull();
            });

            it('does not iterate all entries for a single lookup', async () => {
                const valuesSpy = vi.spyOn(Map.prototype, 'values');

                await repository.findById(CountryId('276'));

                expect(valuesSpy).not.toHaveBeenCalled();
                valuesSpy.mockRestore();
            });
        });

        describe('findAll()', () => {
            it('returns all countries', async () => {
                const countries = await repository.findAll();

                expect(countries).toHaveLength(28);
                expect(countries[0].id).toBe('276');
                expect(countries[countries.length - 1].id).toBe('470');
            });

            it('returns Country instances', async () => {
                const countries = await repository.findAll();

                for (const country of countries) {
                    expect(country).toBeInstanceOf(Country);
                }
            });
        });
    });
});
