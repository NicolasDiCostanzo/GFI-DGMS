import { describe, expect, it } from 'vitest';
import { CountryName } from '../../domain/CountryFunding';
import grantsData from '../data/grants.json';
import { GrantDataValidationError } from '../errors/GrantDataValidationError';
import {
    AirtableJsonCountryFundingRepository,
    type GrantRecord,
} from './AirtableJsonCountryFundingRepository';
import { buildRecord } from './AirtableJsonCountryFundingRepository.spec.fixtures';

describe('AirtableJsonCountryFundingRepository', () => {
    describe('constructor', () => {
        it('throws when data is an empty array', () => {
            expect(() => new AirtableJsonCountryFundingRepository([])).toThrow(Error);
        });

        it('constructs successfully with no arguments using the committed grants.json', () => {
            const repository = new AirtableJsonCountryFundingRepository();

            expect(repository).toBeInstanceOf(AirtableJsonCountryFundingRepository);
        });

        it('constructs successfully with valid data', () => {
            const repository = new AirtableJsonCountryFundingRepository(
                grantsData as GrantRecord[],
            );

            expect(repository).toBeInstanceOf(AirtableJsonCountryFundingRepository);
        });

        it('throws GrantDataValidationError when id is missing', () => {
            const records = [buildRecord({ id: '' })];

            expect(() => new AirtableJsonCountryFundingRepository(records)).toThrow(
                GrantDataValidationError,
            );
        });

        it('identifies the invalid record index in the error message', () => {
            const records = [buildRecord({ id: 'rec1' }), buildRecord({ id: '' })];

            expect.assertions(2);
            try {
                new AirtableJsonCountryFundingRepository(records);
            } catch (error) {
                expect(error).toBeInstanceOf(GrantDataValidationError);
                expect((error as GrantDataValidationError).message).toContain(
                    'Invalid grant record at index 2',
                );
            }
        });
    });

    describe('with valid data', () => {
        const records = [
            buildRecord({ id: 'rec1', country: 'France', fundingAmountUsd: 5_000_000 }),
            buildRecord({ id: 'rec2', country: 'France', fundingAmountUsd: 2_000_000 }),
            buildRecord({ id: 'rec3', country: 'The Netherlands', fundingAmountUsd: 1_000_000 }),
            buildRecord({ id: 'rec4', country: 'United States', fundingAmountUsd: null }),
            buildRecord({ id: 'rec5', country: 'European Union', fundingAmountUsd: 3_000_000 }),
            buildRecord({ id: 'rec6', country: 'Other', fundingAmountUsd: 1_000_000 }),
        ];
        const repository = new AirtableJsonCountryFundingRepository(records);

        describe('findAll()', () => {
            it('groups grants by resolved country and sums disclosed amounts', async () => {
                const all = await repository.findAll();
                const france = all.find((funding) => funding.countryName === 'France');

                expect(france?.grants).toHaveLength(2);
                expect(france?.totalAmountUsd).toBe(7_000_000);
            });

            it('aliases "The Netherlands" to "Netherlands"', async () => {
                const all = await repository.findAll();

                expect(all.some((funding) => funding.countryName === 'The Netherlands')).toBe(
                    false,
                );
                expect(all.some((funding) => funding.countryName === 'Netherlands')).toBe(true);
            });

            it('aliases "United States" to "United States of America"', async () => {
                const all = await repository.findAll();
                const us = all.find(
                    (funding) => funding.countryName === 'United States of America',
                );

                expect(us).toBeDefined();
                expect(us?.disclosedGrantCount).toBe(0);
            });

            it('excludes European Union and Other from any country bucket', async () => {
                const all = await repository.findAll();

                expect(all.some((funding) => funding.countryName === 'European Union')).toBe(false);
                expect(all.some((funding) => funding.countryName === 'Other')).toBe(false);
            });
        });

        describe('findByCountryName()', () => {
            it('returns the funding for a known country', async () => {
                const france = await repository.findByCountryName(CountryName('France'));

                expect(france?.totalAmountUsd).toBe(7_000_000);
            });

            it('returns null for an unknown country', async () => {
                const result = await repository.findByCountryName(CountryName('Atlantis'));

                expect(result).toBeNull();
            });

            it('returns null when queried with the raw (unaliased) Airtable name', async () => {
                const result = await repository.findByCountryName(CountryName('The Netherlands'));

                expect(result).toBeNull();
            });
        });
    });
});
