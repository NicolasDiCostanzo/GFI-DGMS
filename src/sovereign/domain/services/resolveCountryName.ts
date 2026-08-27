import { CountryName } from '@/sovereign/domain/CountryName';

const COUNTRY_NAME_ALIASES: Readonly<Record<string, string>> = {
    'United States': 'United States of America',
    'The Netherlands': 'Netherlands',
};

const NON_COUNTRY_VALUES = new Set(['European Union', 'Other']);

export function resolveCountryName(rawCountry: string | null): CountryName | null {
    if (rawCountry === null || NON_COUNTRY_VALUES.has(rawCountry)) {
        return null;
    }
    return CountryName(COUNTRY_NAME_ALIASES[rawCountry] ?? rawCountry);
}
