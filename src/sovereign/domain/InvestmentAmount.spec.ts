import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { Currency } from '@/shared/types/Currency';
import { describe, expect, it } from 'vitest';
import { InvestmentAmount } from './InvestmentAmount';
import { TargetBudget } from './TargetBudget';

describe('InvestmentAmount', () => {
    const usd = Currency.USD();
    const target = new TargetBudget(1000, usd);

    describe('constructor', () => {
        it('creates an InvestmentAmount with value, currency, and maxAllowed', () => {
            const investment = new InvestmentAmount(500, usd, 2000);

            expect(investment.value).toBe(500);
            expect(investment.currency).toBe(usd);
            expect(investment.maxAllowed).toBe(2000);
        });

        it('allows a value of zero', () => {
            const investment = new InvestmentAmount(0, usd, 2000);

            expect(investment.value).toBe(0);
        });

        it('allows value equal to maxAllowed', () => {
            const investment = new InvestmentAmount(2000, usd, 2000);

            expect(investment.value).toBe(2000);
            expect(investment.maxAllowed).toBe(2000);
        });

        describe('value validation', () => {
            it('throws InvalidNumberException when value is NaN', () => {
                expect(() => new InvestmentAmount(NaN, usd, 2000)).toThrow(InvalidNumberException);
            });

            it('throws InvalidNumberException with a descriptive message for NaN value', () => {
                expect(() => new InvestmentAmount(NaN, usd, 2000)).toThrow(
                    'InvestmentAmount value must not be NaN',
                );
            });

            it('throws InfiniteNumberException when value is Infinity', () => {
                expect(() => new InvestmentAmount(Infinity, usd, 2000)).toThrow(
                    InfiniteNumberException,
                );
            });

            it('throws InfiniteNumberException when value is -Infinity', () => {
                expect(() => new InvestmentAmount(-Infinity, usd, 2000)).toThrow(
                    InfiniteNumberException,
                );
            });

            it('throws InvalidNumberException when value is negative', () => {
                expect(() => new InvestmentAmount(-1, usd, 2000)).toThrow(InvalidNumberException);
            });

            it('throws InvalidNumberException with a descriptive message for negative value', () => {
                expect(() => new InvestmentAmount(-1, usd, 2000)).toThrow(
                    'InvestmentAmount value must not be negative',
                );
            });

            it('throws InvalidNumberException when value exceeds maxAllowed', () => {
                expect(() => new InvestmentAmount(2500, usd, 2000)).toThrow(InvalidNumberException);
            });

            it('throws InvalidNumberException with a descriptive message when value exceeds maxAllowed', () => {
                expect(() => new InvestmentAmount(2500, usd, 2000)).toThrow(
                    'InvestmentAmount value must not exceed maxAllowed',
                );
            });
        });

        describe('maxAllowed validation', () => {
            it('throws InvalidNumberException when maxAllowed is NaN', () => {
                expect(() => new InvestmentAmount(500, usd, NaN)).toThrow(InvalidNumberException);
            });

            it('throws InvalidNumberException with a descriptive message for NaN maxAllowed', () => {
                expect(() => new InvestmentAmount(500, usd, NaN)).toThrow(
                    'InvestmentAmount maxAllowed must not be NaN',
                );
            });

            it('throws InfiniteNumberException when maxAllowed is Infinity', () => {
                expect(() => new InvestmentAmount(500, usd, Infinity)).toThrow(
                    InfiniteNumberException,
                );
            });

            it('throws InfiniteNumberException when maxAllowed is -Infinity', () => {
                expect(() => new InvestmentAmount(500, usd, -Infinity)).toThrow(
                    InfiniteNumberException,
                );
            });

            it('throws NonPositiveNumberException when maxAllowed is zero', () => {
                expect(() => new InvestmentAmount(500, usd, 0)).toThrow(NonPositiveNumberException);
            });

            it('throws NonPositiveNumberException when maxAllowed is negative', () => {
                expect(() => new InvestmentAmount(500, usd, -100)).toThrow(
                    NonPositiveNumberException,
                );
            });

            it('throws NonPositiveNumberException with a descriptive message for invalid maxAllowed', () => {
                expect(() => new InvestmentAmount(500, usd, 0)).toThrow(
                    'InvestmentAmount maxAllowed must be greater than 0',
                );
            });
        });
    });

    describe('toPercentageOf()', () => {
        it('returns 0.0 when value is zero', () => {
            const investment = new InvestmentAmount(0, usd, 2000);

            expect(investment.toPercentageOf(target)).toBe(0);
        });

        it('returns 0.5 when value is half the target', () => {
            const investment = new InvestmentAmount(500, usd, 2000);

            expect(investment.toPercentageOf(target)).toBe(0.5);
        });

        it('returns 1.0 when value equals the target', () => {
            const investment = new InvestmentAmount(1000, usd, 2000);

            expect(investment.toPercentageOf(target)).toBe(1);
        });

        it('returns 2.0 when value is double the target', () => {
            const investment = new InvestmentAmount(2000, usd, 2000);

            expect(investment.toPercentageOf(target)).toBe(2);
        });
    });
});
