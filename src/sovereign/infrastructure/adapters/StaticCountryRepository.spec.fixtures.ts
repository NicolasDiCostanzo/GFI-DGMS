import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { CountryDataValidationError } from '../errors/CountryDataValidationError';
import type { CountryRecord } from './StaticCountryRepository';

export const VALID_RECORD: CountryRecord = {
    id: 'TST',
    name: 'Test Country',
    baselineInvestment: 100,
    targetBudget: 200,
    jobMultiplier: 5,
    co2Multiplier: 3,
    currentNumberOfJobs: 100,
    currentCO2Saved: 50,
};

/**
 * Builds a country record fixture by applying property overrides to the valid record.
 *
 * @param overrides - Properties to replace in the valid record
 * @returns An array containing the resulting country record
 */
export function buildInvalidData(overrides: Record<string, unknown>): CountryRecord[] {
    return [{ ...VALID_RECORD, ...overrides }] as unknown as CountryRecord[];
}

export const VALIDATION_CASES: ReadonlyArray<
    [title: string, overrides: Record<string, unknown>, expected: new (message: string) => Error]
> = [
    ['CountryDataValidationError when id is missing', { id: '' }, CountryDataValidationError],
    ['CountryDataValidationError when id is not a string', { id: 123 }, CountryDataValidationError],
    ['CountryDataValidationError when name is missing', { name: '' }, CountryDataValidationError],
    [
        'CountryDataValidationError when name is not a string',
        { name: 456 },
        CountryDataValidationError,
    ],
    [
        'CountryDataValidationError when baselineInvestment is not a number',
        { baselineInvestment: 'invalid' },
        CountryDataValidationError,
    ],
    [
        'InfiniteNumberException when baselineInvestment is not finite',
        { baselineInvestment: Infinity },
        InfiniteNumberException,
    ],
    [
        'NonPositiveNumberException when targetBudget is not positive',
        { targetBudget: -50 },
        NonPositiveNumberException,
    ],
    [
        'NonPositiveNumberException when targetBudget is zero',
        { targetBudget: 0 },
        NonPositiveNumberException,
    ],
    [
        'CountryDataValidationError when targetBudget is not a number',
        { targetBudget: 'invalid' },
        CountryDataValidationError,
    ],
    [
        'InvalidNumberException when targetBudget is NaN',
        { targetBudget: NaN },
        InvalidNumberException,
    ],
    [
        'CountryDataValidationError when jobMultiplier is not a number',
        { jobMultiplier: 'invalid' },
        CountryDataValidationError,
    ],
    [
        'InfiniteNumberException when jobMultiplier is not finite',
        { jobMultiplier: Infinity },
        InfiniteNumberException,
    ],
    [
        'CountryDataValidationError when co2Multiplier is not a number',
        { co2Multiplier: 'invalid' },
        CountryDataValidationError,
    ],
    [
        'InvalidNumberException when co2Multiplier is NaN',
        { co2Multiplier: NaN },
        InvalidNumberException,
    ],
    [
        'CountryDataValidationError when currentNumberOfJobs is not a number',
        { currentNumberOfJobs: 'invalid' },
        CountryDataValidationError,
    ],
    [
        'InvalidNumberException when currentNumberOfJobs is NaN',
        { currentNumberOfJobs: NaN },
        InvalidNumberException,
    ],
    [
        'InfiniteNumberException when currentNumberOfJobs is Infinity',
        { currentNumberOfJobs: Infinity },
        InfiniteNumberException,
    ],
    [
        'CountryDataValidationError when currentCO2Saved is not a number',
        { currentCO2Saved: 'invalid' },
        CountryDataValidationError,
    ],
    [
        'InvalidNumberException when currentCO2Saved is NaN',
        { currentCO2Saved: NaN },
        InvalidNumberException,
    ],
    [
        'InfiniteNumberException when currentCO2Saved is Infinity',
        { currentCO2Saved: Infinity },
        InfiniteNumberException,
    ],
];
