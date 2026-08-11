import { describe, expect, it } from 'vitest';
import { calculateEuFundingTodayUsd } from './calculateEuFundingToday';
import { buildCountryFunding, buildGrant } from './calculateEuFundingToday.spec.fixtures';

describe('calculateEuFundingTodayUsd', () => {
    it('sums EU member country totals', () => {
        const countryFundings = [
            buildCountryFunding('France', 5_000_000),
            buildCountryFunding('Germany', 2_000_000),
        ];

        expect(calculateEuFundingTodayUsd(countryFundings, [])).toBe(7_000_000);
    });

    it('excludes non-EU member country totals', () => {
        const countryFundings = [
            buildCountryFunding('France', 5_000_000),
            buildCountryFunding('United States of America', 100_000_000),
            buildCountryFunding('South Korea', 50_000_000),
            buildCountryFunding('Spain', 1_000_000),
        ];

        expect(calculateEuFundingTodayUsd(countryFundings, [])).toBe(6_000_000);
    });

    it('adds grants tagged "European Union" from the unattributed bucket', () => {
        const countryFundings = [buildCountryFunding('France', 5_000_000)];
        const unattributedGrants = [buildGrant('European Union', 3_000_000)];

        expect(calculateEuFundingTodayUsd(countryFundings, unattributedGrants)).toBe(8_000_000);
    });

    it('ignores unattributed grants not tagged "European Union"', () => {
        const unattributedGrants = [buildGrant('Other', 3_000_000)];

        expect(calculateEuFundingTodayUsd([], unattributedGrants)).toBe(0);
    });

    it('treats an undisclosed European Union grant amount as zero', () => {
        const unattributedGrants = [buildGrant('European Union', null)];

        expect(calculateEuFundingTodayUsd([], unattributedGrants)).toBe(0);
    });

    it('returns zero for no data', () => {
        expect(calculateEuFundingTodayUsd([], [])).toBe(0);
    });
});
