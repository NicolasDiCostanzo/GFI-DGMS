import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { InvestmentExceedsMaxAllowedException } from './errors/InvestmentExceedsMaxAllowedException';

export const INVALID_VALUES: ReadonlyArray<
    [title: string, value: number, expected: new (message: string) => Error]
> = [
    ['InvalidNumberException when value is NaN', NaN, InvalidNumberException],
    ['InfiniteNumberException when value is Infinity', Infinity, InfiniteNumberException],
    ['InfiniteNumberException when value is -Infinity', -Infinity, InfiniteNumberException],
    ['InvalidNumberException when value is negative', -1, InvalidNumberException],
    [
        'InvestmentExceedsMaxAllowedException when value exceeds maxAllowed',
        2500,
        InvestmentExceedsMaxAllowedException,
    ],
];

export const INVALID_MAX_ALLOWED: ReadonlyArray<
    [title: string, maxAllowed: number, expected: new (message: string) => Error]
> = [
    ['InvalidNumberException when maxAllowed is NaN', NaN, InvalidNumberException],
    ['InfiniteNumberException when maxAllowed is Infinity', Infinity, InfiniteNumberException],
    ['InfiniteNumberException when maxAllowed is -Infinity', -Infinity, InfiniteNumberException],
    ['NonPositiveNumberException when maxAllowed is zero', 0, NonPositiveNumberException],
    ['NonPositiveNumberException when maxAllowed is negative', -100, NonPositiveNumberException],
];
