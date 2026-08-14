import { SettingsParseError } from '@/shared/errors/SettingsParseError';
import { SettingsStorageError } from '@/shared/errors/SettingsStorageError';
import { GrantCountryMismatchException } from '@/sovereign/domain/errors/GrantCountryMismatchException';
import { CountryLoadError } from './CountryLoadError';

export const NAMED_ERROR_CASES: ReadonlyArray<[string, new (message: string) => Error, string]> = [
    ['SettingsParseError', SettingsParseError, 'Failed to parse settings from localStorage'],
    ['SettingsStorageError', SettingsStorageError, 'Failed to save settings to localStorage'],
    [
        'GrantCountryMismatchException',
        GrantCountryMismatchException,
        'CountryFunding grant rec1 has country Germany, expected France',
    ],
    ['CountryLoadError', CountryLoadError, 'network down'],
];
