import { InvestmentExceedsMaxAllowedException } from '@/sovereign/domain/errors/InvestmentExceedsMaxAllowedException';
import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { SettingsParseError } from '@/shared/errors/SettingsParseError';
import { SettingsStorageError } from '@/shared/errors/SettingsStorageError';
import { CountryLoadError } from './CountryLoadError';

export const NAMED_ERROR_CASES: ReadonlyArray<[string, new (message: string) => Error, string]> = [
    ['InfiniteNumberException', InfiniteNumberException, 'TargetBudget amount must be finite'],
    ['InvalidNumberException', InvalidNumberException, 'TargetBudget amount must not be NaN'],
    [
        'NonPositiveNumberException',
        NonPositiveNumberException,
        'TargetBudget amount must be greater than 0',
    ],
    ['SettingsParseError', SettingsParseError, 'Failed to parse settings from localStorage'],
    ['SettingsStorageError', SettingsStorageError, 'Failed to save settings to localStorage'],
    [
        'InvestmentExceedsMaxAllowedException',
        InvestmentExceedsMaxAllowedException,
        'InvestmentAmount value must not exceed maxAllowed',
    ],
    ['CountryLoadError', CountryLoadError, 'network down'],
];
