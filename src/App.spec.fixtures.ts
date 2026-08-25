import { CountryFunding, CountryName } from '@/sovereign/domain/CountryFunding';
import { Grant, GrantId } from '@/sovereign/domain/Grant';

export function buildCountryFunding(countryName: string, amountUsd: number): CountryFunding {
    const grant = new Grant(
        GrantId('rec1'),
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
    return new CountryFunding(CountryName(countryName), [grant]);
}

export const GERMANY_FUNDING = buildCountryFunding('Germany', 5_000_000);
export const FRANCE_FUNDING = buildCountryFunding('France', 2_000_000);

export function createMockLocalStorage(overrides: Partial<Storage>): Storage {
    return {
        getItem: () => null,
        ...overrides,
    } as Storage;
}
