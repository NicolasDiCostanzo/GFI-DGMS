import { CountryFunding, CountryName } from '@/sovereign/domain/CountryFunding';
import { Grant, GrantId } from '@/sovereign/domain/Grant';

export function buildGrant(id: string, countryName: string, amountUsd: number): Grant {
    return new Grant(
        GrantId(id),
        CountryName(countryName),
        'Untitled grant',
        amountUsd,
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
}

export function buildCountryFunding(countryName: string, amountUsd: number): CountryFunding {
    return new CountryFunding(CountryName(countryName), [
        buildGrant('rec1', countryName, amountUsd),
    ]);
}

export const GERMANY_FUNDING = buildCountryFunding('Germany', 5_000_000);
export const FRANCE_FUNDING = buildCountryFunding('France', 2_000_000);

export function createMockLocalStorage(overrides: Partial<Storage>): Storage {
    return {
        getItem: () => null,
        ...overrides,
    } as Storage;
}
