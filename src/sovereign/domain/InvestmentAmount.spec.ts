import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { Currency } from '@/shared/types/Currency';
import { describe, expect, it } from 'vitest';
import { InvestmentExceedsMaxAllowedException } from './errors/InvestmentExceedsMaxAllowedException';
import { InvestmentAmount } from './InvestmentAmount';

describe('InvestmentAmount', () => {
    const usd = Currency.USD();

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
                expect.assertions(2);

                try {
                    new InvestmentAmount(NaN, usd, 2000);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidNumberException);
                    expect((error as InvalidNumberException).message).toContain(
                        'InvestmentAmount value must not be NaN',
                    );
                }
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
                expect.assertions(2);

                try {
                    new InvestmentAmount(-1, usd, 2000);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidNumberException);
                    expect((error as InvalidNumberException).message).toContain(
                        'InvestmentAmount value must not be negative',
                    );
                }
            });

            it('throws InvestmentExceedsMaxAllowedException when value exceeds maxAllowed', () => {
                expect(() => new InvestmentAmount(2500, usd, 2000)).toThrow(
                    InvestmentExceedsMaxAllowedException,
                );
            });

            it('throws InvestmentExceedsMaxAllowedException with a descriptive message when value exceeds maxAllowed', () => {
                expect.assertions(2);

                try {
                    new InvestmentAmount(2500, usd, 2000);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvestmentExceedsMaxAllowedException);
                    expect((error as InvestmentExceedsMaxAllowedException).message).toContain(
                        'InvestmentAmount value must not exceed maxAllowed',
                    );
                }
            });
        });

        describe('maxAllowed validation', () => {
            it('throws InvalidNumberException when maxAllowed is NaN', () => {
                expect(() => new InvestmentAmount(500, usd, NaN)).toThrow(InvalidNumberException);
            });

            it('throws InvalidNumberException with a descriptive message for NaN maxAllowed', () => {
                expect.assertions(2);

                try {
                    new InvestmentAmount(500, usd, NaN);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidNumberException);
                    expect((error as InvalidNumberException).message).toContain(
                        'InvestmentAmount maxAllowed must not be NaN',
                    );
                }
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
                expect.assertions(2);

                try {
                    new InvestmentAmount(500, usd, 0);
                } catch (error) {
                    expect(error).toBeInstanceOf(NonPositiveNumberException);
                    expect((error as NonPositiveNumberException).message).toContain(
                        'InvestmentAmount maxAllowed must be greater than 0',
                    );
                }
            });
        });
    });
});
