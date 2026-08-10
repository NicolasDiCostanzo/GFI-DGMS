import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { describe, expect, it } from 'vitest';
import { TargetBudget } from './TargetBudget';
import { INVALID_AMOUNTS } from './TargetBudget.spec.fixtures';

describe('TargetBudget', () => {
    describe('constructor', () => {
        it('creates a TargetBudget with amount', () => {
            const target = new TargetBudget(1000);

            expect(target.amount).toBe(1000);
        });

        it.each(INVALID_AMOUNTS)('throws %s', (_title, amount, expected) => {
            expect(() => new TargetBudget(amount)).toThrow(expected);
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
    });
});
