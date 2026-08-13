import { CountryName } from '../domain/CountryFunding';
import { describe, expect, it } from 'vitest';
import { GetCountryFundingOverview } from './GetCountryFundingOverview';
import {
    EU_GRANT,
    FRANCE_FUNDING,
    MockCountryFundingRepository,
} from './GetCountryFundingOverview.spec.fixtures';

describe('GetCountryFundingOverview', () => {
    describe('execute()', () => {
        it('returns the country fundings and unattributed grants from the repository', async () => {
            const repository = new MockCountryFundingRepository([FRANCE_FUNDING], [EU_GRANT]);
            const useCase = new GetCountryFundingOverview(repository);

            const overview = await useCase.execute();

            expect(overview.countryFundings).toEqual([FRANCE_FUNDING]);
            expect(overview.unattributedGrants).toEqual([EU_GRANT]);
        });

        it('returns empty results when the repository has no data', async () => {
            const repository = new MockCountryFundingRepository([], []);
            const useCase = new GetCountryFundingOverview(repository);

            const overview = await useCase.execute();

            expect(overview.countryFundings).toEqual([]);
            expect(overview.unattributedGrants).toEqual([]);
        });
    });

    describe('MockCountryFundingRepository fixture', () => {
        it('findByCountryName always returns null (unused by this use case)', async () => {
            const repository = new MockCountryFundingRepository([FRANCE_FUNDING], []);

            await expect(repository.findByCountryName(CountryName('France'))).resolves.toBeNull();
        });
    });
});
