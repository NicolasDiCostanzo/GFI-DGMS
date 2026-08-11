import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { SettingsParseError } from '@/shared/errors/SettingsParseError';
import { SettingsStorageError } from '@/shared/errors/SettingsStorageError';
import { InvalidInvestmentError } from '@/sovereign/app/errors/InvalidInvestmentError';
import { GrantCountryMismatchException } from '@/sovereign/domain/errors/GrantCountryMismatchException';
import { InvestmentExceedsMaxAllowedException } from '@/sovereign/domain/errors/InvestmentExceedsMaxAllowedException';
import { CountryDataValidationError } from './CountryDataValidationError';
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
    [
        'GrantCountryMismatchException',
        GrantCountryMismatchException,
        'CountryFunding grant rec1 has country Germany, expected France',
    ],
    ['CountryLoadError', CountryLoadError, 'network down'],
    [
        'CountryDataValidationError',
        CountryDataValidationError,
        "Invalid country record at index 1: 'id' must be a non-empty string",
    ],
    [
        'InvalidInvestmentError',
        InvalidInvestmentError,
        'Investment 100 exceeds maximum allowed 500 for country US',
    ],
];
