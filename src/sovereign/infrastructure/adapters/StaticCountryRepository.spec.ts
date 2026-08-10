import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Country, CountryId } from '../../domain/Country';
import countriesData from '../data/countries.json';
import { CountryDataValidationError } from '../errors/CountryDataValidationError';
import { StaticCountryRepository, type CountryRecord } from './StaticCountryRepository';
import {
    buildInvalidData,
    VALID_RECORD,
    VALIDATION_CASES,
} from './StaticCountryRepository.spec.fixtures';

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

        it.each(VALIDATION_CASES)('throws %s', (_title, overrides, expected) => {
            expect(() => new StaticCountryRepository(buildInvalidData(overrides))).toThrow(
                expected,
            );
        });

        it('identifies the invalid record index in error message', () => {
            const invalidData = [
                { ...VALID_RECORD, id: 'TST1', name: 'Test Country 1' },
                { ...VALID_RECORD, id: '', name: 'Test Country 2' },
            ];

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

                expect(countries).toHaveLength(27);
                expect(countries[0].id).toBe('276');
                expect(countries[countries.length - 1].id).toBe('196');
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
