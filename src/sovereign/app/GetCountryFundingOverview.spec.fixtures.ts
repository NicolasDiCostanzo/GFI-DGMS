import { CountryFunding, CountryName } from '@/sovereign/domain/CountryFunding';
import { Grant, GrantId } from '@/sovereign/domain/Grant';
import { CountryFundingRepository } from '@/sovereign/domain/repository/CountryFundingRepository';

export class MockCountryFundingRepository implements CountryFundingRepository {
    constructor(
        private readonly countryFundings: CountryFunding[],
        private readonly unattributedGrants: readonly Grant[],
    ) {}

    findByCountryName(_name: CountryName): Promise<CountryFunding | null> {
        return Promise.resolve(null);
    }

    findAll(): Promise<CountryFunding[]> {
        return Promise.resolve(this.countryFundings);
    }

    findUnattributedGrants(): Promise<readonly Grant[]> {
        return Promise.resolve(this.unattributedGrants);
    }
}

export const FRANCE_FUNDING = new CountryFunding(CountryName('France'), [
    new Grant(
        GrantId('rec1'),
        CountryName('France'),
        'Untitled grant',
        1_000_000,
        [],
        null,
        null,
        null,
        null,
        null,
        [],
        [],
        null,
    ),
]);

export const EU_GRANT = new Grant(
    GrantId('rec2'),
    CountryName('European Union'),
    'Untitled grant',
    2_000_000,
    [],
    null,
    null,
    null,
    null,
    null,
    [],
    [],
    null,
);
