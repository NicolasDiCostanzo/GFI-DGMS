import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { Currency } from '@/shared/types/Currency';
import { describe, expect, it } from 'vitest';
import { TargetBudget } from './TargetBudget';

describe('TargetBudget', () => {
    describe('constructor', () => {
        it('creates a TargetBudget with amount and currency', () => {
            const usd = Currency.USD();
            const target = new TargetBudget(1000, usd);

            expect(target.amount).toBe(1000);
            expect(target.currency).toBe(usd);
        });

        it('throws NonPositiveNumberException when amount is zero', () => {
            expect(() => new TargetBudget(0, Currency.USD())).toThrow(NonPositiveNumberException);
        });

        it('throws NonPositiveNumberException when amount is negative', () => {
            expect(() => new TargetBudget(-500, Currency.USD())).toThrow(
                NonPositiveNumberException,
            );
        });

        it('throws NonPositiveNumberException with a descriptive message', () => {
            expect(() => new TargetBudget(0, Currency.USD())).toThrow(
                'TargetBudget amount must be greater than 0',
            );
        });

        it('throws InvalidNumberException when amount is NaN', () => {
            expect(() => new TargetBudget(NaN, Currency.USD())).toThrow(InvalidNumberException);
        });

        it('throws InfiniteNumberException when amount is Infinity', () => {
            expect(() => new TargetBudget(Infinity, Currency.USD())).toThrow(
                InfiniteNumberException,
            );
        });

        it('throws InfiniteNumberException when amount is -Infinity', () => {
            expect(() => new TargetBudget(-Infinity, Currency.USD())).toThrow(
                InfiniteNumberException,
            );
        });
    });

    describe('percentageOf()', () => {
        const target = new TargetBudget(1000, Currency.USD());

        it('returns 0.0 when actual is zero', () => {
            expect(target.percentageOf(0)).toBe(0);
        });

        it('returns 0.5 when actual is half the target', () => {
            expect(target.percentageOf(500)).toBe(0.5);
        });

        it('returns 1.0 when actual equals the target', () => {
            expect(target.percentageOf(1000)).toBe(1);
        });

        it('returns 2.0 when actual is double the target', () => {
            expect(target.percentageOf(2000)).toBe(2);
        });

        it('returns 3.0 when actual is triple the target', () => {
            expect(target.percentageOf(3000)).toBe(3);
        });
    });
});
