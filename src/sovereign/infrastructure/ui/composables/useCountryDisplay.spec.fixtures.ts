import { CountryFunding, CountryName } from '@/sovereign/domain/CountryFunding';
import { Grant, GrantId } from '@/sovereign/domain/Grant';

export function buildCountryFunding(countryName: string, amountUsd: number): CountryFunding {
    const grant = new Grant(
        GrantId('rec1'),
        countryName,
        'Untitled grant',
        amountUsd > 0 ? amountUsd : null,
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
