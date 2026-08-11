import { afterEach, describe, expect, it, vi } from 'vitest';
import { CountryName } from '../../domain/CountryFunding';
import grantsData from '../data/grants.json';
import { GrantDataValidationError } from '../errors/GrantDataValidationError';
import {
    AirtableJsonCountryFundingRepository,
    loadGrantRecords,
    type GrantRecord,
} from './AirtableJsonCountryFundingRepository';
import { buildRecord } from './AirtableJsonCountryFundingRepository.spec.fixtures';

describe('loadGrantRecords', () => {
    afterEach(() => {
        vi.unstubAllGlobals();
    });

    it('fetches and parses the grant data asset', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({
                ok: true,
                json: () => Promise.resolve(grantsData),
            }),
        );

        const records = await loadGrantRecords();

        expect(records).toEqual(grantsData);
    });

    it('throws when the fetch response is not ok', async () => {
        vi.stubGlobal(
            'fetch',
            vi.fn().mockResolvedValue({ ok: false, status: 404, statusText: 'Not Found' }),
        );

        await expect(loadGrantRecords()).rejects.toThrow('Failed to load grant data: 404');
    });
});

describe('AirtableJsonCountryFundingRepository', () => {
    describe('constructor', () => {
        it('throws when data is an empty array', () => {
            expect(() => new AirtableJsonCountryFundingRepository([])).toThrow(Error);
        });

        it('constructs successfully with the real committed grants.json', () => {
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

        describe('findUnattributedGrants()', () => {
            it('returns the European Union and Other grants excluded from every country bucket', async () => {
                const unattributed = await repository.findUnattributedGrants();

                expect(unattributed).toHaveLength(2);
                expect(unattributed.map((grant) => grant.country).sort()).toEqual([
                    'European Union',
                    'Other',
                ]);
            });

            it('preserves the raw (unaliased) country label on unattributed grants', async () => {
                const unattributed = await repository.findUnattributedGrants();
                const euGrant = unattributed.find((grant) => grant.id === 'rec5');

                expect(euGrant?.amountUsd).toBe(3_000_000);
            });

            it('falls back to "Unknown" when a record has no country at all', async () => {
                const withoutCountry = new AirtableJsonCountryFundingRepository([
                    buildRecord({ id: 'rec1', country: null }),
                ]);
                const unattributed = await withoutCountry.findUnattributedGrants();

                expect(unattributed[0]?.country).toBe('Unknown');
            });
        });
    });
});
