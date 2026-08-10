import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';

export const INVALID_AMOUNTS: ReadonlyArray<
    [title: string, amount: number, expected: new (message: string) => Error]
> = [
    ['NonPositiveNumberException when amount is zero', 0, NonPositiveNumberException],
    ['NonPositiveNumberException when amount is negative', -500, NonPositiveNumberException],
    ['InvalidNumberException when amount is NaN', NaN, InvalidNumberException],
    ['InfiniteNumberException when amount is Infinity', Infinity, InfiniteNumberException],
    ['InfiniteNumberException when amount is -Infinity', -Infinity, InfiniteNumberException],
];
