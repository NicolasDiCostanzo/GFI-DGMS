import { CountryName } from './CountryName';
import { Grant, GrantId } from './Grant';

export function buildGrant(overrides: {
    id: string;
    amountUsd: number | null;
    country?: string;
}): Grant {
    return new Grant(
        GrantId(overrides.id),
        CountryName(overrides.country ?? 'France'),
        'Untitled grant',
        overrides.amountUsd,
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
