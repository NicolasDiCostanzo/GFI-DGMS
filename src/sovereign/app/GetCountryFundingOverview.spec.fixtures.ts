import { CountryFunding, CountryName } from '../domain/CountryFunding';
import { Grant, GrantId } from '../domain/Grant';
import { CountryFundingRepository } from '../domain/repository/CountryFundingRepository';

export class MockCountryFundingRepository implements CountryFundingRepository {
    constructor(
        private readonly countryFundings: CountryFunding[],
        private readonly unattributedGrants: readonly Grant[],
    ) {}

    // GetCountryFundingOverview never calls this — only implemented to satisfy the port.
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
        'France',
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
    'European Union',
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
