import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';

export const FUNDING_PROGRESS_CASES: ReadonlyArray<
    [title: string, investment: number, target: number, expected: number]
> = [
    ['returns 0.0 when investment is zero', 0, 1000, 0],
    ['returns 1.0 when investment equals the target', 1000, 1000, 1],
    ['returns 0.5 when investment is half the target', 500, 1000, 0.5],
    ['returns 1.5 when investment is 150% of the target', 1500, 1000, 1.5],
    ['clamps to 2.0 when investment is double the target', 2000, 1000, 2],
    ['clamps to 2.0 when investment exceeds double the target', 3000, 1000, 2],
    ['clamps to 0.0 when investment is negative', -500, 1000, 0],
    [
        'clamps to 0.0 when investment is negative and larger in magnitude than target',
        -5000,
        1000,
        0,
    ],
];

export const ADDITIONAL_JOBS_CASES: ReadonlyArray<
    [title: string, investment: number, baseline: number, multiplier: number, expected: number]
> = [
    ['returns 0 when investment equals baseline', 500, 500, 10, 0],
    ['returns a positive integer when investment exceeds baseline', 1000, 500, 10, 5000],
    [
        'returns a negative integer when investment is below baseline (funding deficit)',
        0,
        500,
        10,
        -5000,
    ],
    [
        'returns a negative integer when investment is zero (funding deficit edge case)',
        0,
        1000,
        5,
        -5000,
    ],
    ['rounds to the nearest whole number when the raw result is fractional', 501, 500, 0.5, 1],
    ['rounds .5 up to the nearest whole number', 501, 500, 1.5, 2],
    ['rounds a large fractional result correctly', 1001, 500, 0.33, 165],
    ['returns 0 when multiplier is zero regardless of delta', 1000, 500, 0, 0],
    [
        'returns a negative integer when delta is negative and multiplier is decimal',
        498,
        500,
        2.5,
        -5,
    ],
];

export const ADDITIONAL_CO2_CASES: ReadonlyArray<
    [title: string, investment: number, baseline: number, multiplier: number, expected: number]
> = [
    ['returns 0 when investment equals baseline', 500, 500, 5, 0],
    ['returns a positive number when investment exceeds baseline', 1000, 500, 5, 2500],
    [
        'returns a negative number when investment is below baseline (funding deficit)',
        250,
        500,
        5,
        -1250,
    ],
    [
        'returns a negative number when investment is zero (funding deficit edge case)',
        0,
        1000,
        3,
        -3000,
    ],
    ['returns a decimal value when the multiplier produces one', 1000, 500, 0.75, 375],
    ['returns a fractional decimal when delta and multiplier produce one', 1001, 500, 0.33, 165.33],
    ['returns 0 when multiplier is zero regardless of delta', 1000, 500, 0, 0],
];

export const FUNDING_PROGRESS_VALIDATION_CASES: ReadonlyArray<
    [title: string, investment: number, target: number, expected: new (message: string) => Error]
> = [
    ['NonPositiveNumberException when target is zero', 500, 0, NonPositiveNumberException],
    ['NonPositiveNumberException when target is negative', 500, -100, NonPositiveNumberException],
    ['InvalidNumberException when investment is NaN', NaN, 1000, InvalidNumberException],
    [
        'InfiniteNumberException when investment is Infinity',
        Infinity,
        1000,
        InfiniteNumberException,
    ],
    [
        'InfiniteNumberException when investment is -Infinity',
        -Infinity,
        1000,
        InfiniteNumberException,
    ],
    ['InvalidNumberException when target is NaN', 500, NaN, InvalidNumberException],
    ['InfiniteNumberException when target is Infinity', 500, Infinity, InfiniteNumberException],
    ['InfiniteNumberException when target is -Infinity', 500, -Infinity, InfiniteNumberException],
];

// Shared by calculateAdditionalJobs() and calculateAdditionalCO2(): both take
// (investment, baseline, multiplier) and validate each argument identically.
export const ADDITIONAL_YIELD_VALIDATION_CASES: ReadonlyArray<
    [
        title: string,
        investment: number,
        baseline: number,
        multiplier: number,
        expected: new (message: string) => Error,
    ]
> = [
    ['InvalidNumberException when investment is NaN', NaN, 500, 10, InvalidNumberException],
    [
        'InfiniteNumberException when investment is Infinity',
        Infinity,
        500,
        10,
        InfiniteNumberException,
    ],
    ['InvalidNumberException when baseline is NaN', 500, NaN, 10, InvalidNumberException],
    [
        'InfiniteNumberException when baseline is Infinity',
        500,
        Infinity,
        10,
        InfiniteNumberException,
    ],
    ['InvalidNumberException when multiplier is NaN', 500, 500, NaN, InvalidNumberException],
    [
        'InfiniteNumberException when multiplier is Infinity',
        500,
        500,
        Infinity,
        InfiniteNumberException,
    ],
    [
        'InfiniteNumberException when multiplier is -Infinity',
        500,
        500,
        -Infinity,
        InfiniteNumberException,
    ],
];
