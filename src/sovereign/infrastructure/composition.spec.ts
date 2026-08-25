import { describe, expect, it, vi } from 'vitest';
import { loadCountryFundingOverview } from './composition';

const findAllMock = vi.fn();
const findUnattributedGrantsMock = vi.fn();

vi.mock('@/sovereign/infrastructure/adapters/AirtableJsonCountryFundingRepository', () => ({
    AirtableJsonCountryFundingRepository: vi.fn().mockImplementation(function () {
        return { findAll: findAllMock, findUnattributedGrants: findUnattributedGrantsMock };
    }),
    loadGrantRecords: vi.fn().mockResolvedValue([]),
}));

describe('loadCountryFundingOverview', () => {
    it('loads grant records, builds the repository, and returns the overview', async () => {
        findAllMock.mockResolvedValue(['country-funding']);
        findUnattributedGrantsMock.mockResolvedValue(['unattributed-grant']);

        const overview = await loadCountryFundingOverview();

        expect(overview).toEqual({
            countryFundings: ['country-funding'],
            unattributedGrants: ['unattributed-grant'],
        });
    });
});
