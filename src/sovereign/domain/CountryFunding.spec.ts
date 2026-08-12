import { describe, expect, it } from 'vitest';
import { CountryFunding, CountryName } from './CountryFunding';
import { buildGrant } from './CountryFunding.spec.fixtures';
import { GrantCountryMismatchException } from './errors/GrantCountryMismatchException';

describe('CountryFunding', () => {
    describe('constructor', () => {
        it('sums only grants with a disclosed amount', () => {
            const grants = [
                buildGrant({ id: 'rec1', amountUsd: 1_000_000 }),
                buildGrant({ id: 'rec2', amountUsd: null }),
                buildGrant({ id: 'rec3', amountUsd: 2_500_000 }),
            ];

            const funding = new CountryFunding(CountryName('France'), grants);

            expect(funding.totalAmountUsd).toBe(3_500_000);
            expect(funding.disclosedGrantCount).toBe(2);
            expect(funding.countryName).toBe('France');
        });

        it('is unaffected by mutations to the input grants array after construction', () => {
            const grants = [
                buildGrant({ id: 'rec1', amountUsd: 1_000_000 }),
                buildGrant({ id: 'rec2', amountUsd: null }),
                buildGrant({ id: 'rec3', amountUsd: 2_500_000 }),
            ];

            const funding = new CountryFunding(CountryName('France'), grants);

            grants.push(buildGrant({ id: 'rec4', amountUsd: 9_000_000 }));
            grants.splice(0, 1);

            expect(funding.totalAmountUsd).toBe(3_500_000);
            expect(funding.disclosedGrantCount).toBe(2);
            expect(funding.grants).toHaveLength(3);
        });

        it('returns zero totals for an empty grant list', () => {
            const funding = new CountryFunding(CountryName('France'), []);

            expect(funding.totalAmountUsd).toBe(0);
            expect(funding.disclosedGrantCount).toBe(0);
        });

        it('returns zero totals when no grant has a disclosed amount', () => {
            const grants = [buildGrant({ id: 'rec1', amountUsd: null })];

            const funding = new CountryFunding(CountryName('France'), grants);

            expect(funding.totalAmountUsd).toBe(0);
            expect(funding.disclosedGrantCount).toBe(0);
        });

        it('throws GrantCountryMismatchException when a grant country differs from the requested country', () => {
            const grants = [
                buildGrant({ id: 'rec1', amountUsd: 1_000_000 }),
                buildGrant({ id: 'rec2', amountUsd: 2_500_000, country: 'Germany' }),
            ];

            expect(() => new CountryFunding(CountryName('France'), grants)).toThrow(
                GrantCountryMismatchException,
            );
        });
    });
});
