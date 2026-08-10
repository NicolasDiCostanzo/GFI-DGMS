import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { describe, expect, it } from 'vitest';
import { TargetBudget } from './TargetBudget';

describe('TargetBudget', () => {
    describe('constructor', () => {
        it('creates a TargetBudget with amount', () => {
            const target = new TargetBudget(1000);

            expect(target.amount).toBe(1000);
        });

        it('throws NonPositiveNumberException when amount is zero', () => {
            expect(() => new TargetBudget(0)).toThrow(NonPositiveNumberException);
        });

        it('throws NonPositiveNumberException when amount is negative', () => {
            expect(() => new TargetBudget(-500)).toThrow(NonPositiveNumberException);
        });

        it('throws NonPositiveNumberException with a descriptive message', () => {
            expect.assertions(2);

            try {
                new TargetBudget(0);
            } catch (error) {
                expect(error).toBeInstanceOf(NonPositiveNumberException);
                expect((error as NonPositiveNumberException).message).toContain(
                    'TargetBudget amount must be greater than 0',
                );
            }
        });

        it('throws InvalidNumberException when amount is NaN', () => {
            expect(() => new TargetBudget(NaN)).toThrow(InvalidNumberException);
        });

        it('throws InfiniteNumberException when amount is Infinity', () => {
            expect(() => new TargetBudget(Infinity)).toThrow(InfiniteNumberException);
        });

        it('throws InfiniteNumberException when amount is -Infinity', () => {
            expect(() => new TargetBudget(-Infinity)).toThrow(InfiniteNumberException);
        });
    });
});
