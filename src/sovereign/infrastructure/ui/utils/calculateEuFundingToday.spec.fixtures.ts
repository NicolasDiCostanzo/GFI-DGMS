import { CountryFunding, CountryName } from '@/sovereign/domain/CountryFunding';
import { Grant, GrantId } from '@/sovereign/domain/Grant';

let nextId = 1;

export function buildGrant(country: string, amountUsd: number | null): Grant {
    return new Grant(
        GrantId(`rec${nextId++}`),
        country,
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
    return new CountryFunding(CountryName(countryName), [buildGrant(countryName, amountUsd)]);
}
