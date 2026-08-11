import { CountryFunding, CountryName } from '@/sovereign/domain/CountryFunding';
import { Grant, GrantId } from '@/sovereign/domain/Grant';

export function buildCountryFunding(countryName: string, amountUsd: number): CountryFunding {
    const grant = new Grant(
        GrantId('rec1'),
        countryName,
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

// Only getItem gets a real (always-empty) default: it's the only member every
// caller relies on without overriding. App.vue never calls removeItem/clear/key,
/**
 * Creates a mock `Storage` object with an empty `getItem` default.
 *
 * @param overrides - Storage properties or methods that replace the defaults
 * @returns A mock `Storage` object
 */
export function createMockLocalStorage(overrides: Partial<Storage>): Storage {
    return {
        getItem: () => null,
        ...overrides,
    } as Storage;
}
