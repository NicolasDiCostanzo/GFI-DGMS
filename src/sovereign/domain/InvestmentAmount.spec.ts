import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { describe, expect, it } from 'vitest';
import { InvestmentExceedsMaxAllowedException } from './errors/InvestmentExceedsMaxAllowedException';
import { INVALID_MAX_ALLOWED, INVALID_VALUES } from './InvestmentAmount.spec.fixtures';
import { InvestmentAmount } from './InvestmentAmount';

describe('InvestmentAmount', () => {
    describe('constructor', () => {
        it('creates an InvestmentAmount with value and maxAllowed', () => {
            const investment = new InvestmentAmount(500, 2000);

            expect(investment.value).toBe(500);
            expect(investment.maxAllowed).toBe(2000);
        });

        it('allows a value of zero', () => {
            const investment = new InvestmentAmount(0, 2000);

            expect(investment.value).toBe(0);
        });

        it('allows value equal to maxAllowed', () => {
            const investment = new InvestmentAmount(2000, 2000);

            expect(investment.value).toBe(2000);
            expect(investment.maxAllowed).toBe(2000);
        });

        describe('value validation', () => {
            it.each(INVALID_VALUES)('throws %s', (_title, value, expected) => {
                expect(() => new InvestmentAmount(value, 2000)).toThrow(expected);
            });

            it('throws InvalidNumberException with a descriptive message for NaN value', () => {
                expect.assertions(2);

                try {
                    new InvestmentAmount(NaN, 2000);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidNumberException);
                    expect((error as InvalidNumberException).message).toContain(
                        'InvestmentAmount value must not be NaN',
                    );
                }
            });

            it('throws InvalidNumberException with a descriptive message for negative value', () => {
                expect.assertions(2);

                try {
                    new InvestmentAmount(-1, 2000);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidNumberException);
                    expect((error as InvalidNumberException).message).toContain(
                        'InvestmentAmount value must not be negative',
                    );
                }
            });

            it('throws InvestmentExceedsMaxAllowedException with a descriptive message when value exceeds maxAllowed', () => {
                expect.assertions(2);

                try {
                    new InvestmentAmount(2500, 2000);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvestmentExceedsMaxAllowedException);
                    expect((error as InvestmentExceedsMaxAllowedException).message).toContain(
                        'InvestmentAmount value must not exceed maxAllowed',
                    );
                }
            });
        });

        describe('maxAllowed validation', () => {
            it.each(INVALID_MAX_ALLOWED)('throws %s', (_title, maxAllowed, expected) => {
                expect(() => new InvestmentAmount(500, maxAllowed)).toThrow(expected);
            });

            it('throws InvalidNumberException with a descriptive message for NaN maxAllowed', () => {
                expect.assertions(2);

                try {
                    new InvestmentAmount(500, NaN);
                } catch (error) {
                    expect(error).toBeInstanceOf(InvalidNumberException);
                    expect((error as InvalidNumberException).message).toContain(
                        'InvestmentAmount maxAllowed must not be NaN',
                    );
                }
            });

            it('throws NonPositiveNumberException with a descriptive message for invalid maxAllowed', () => {
                expect.assertions(2);

                try {
                    new InvestmentAmount(500, 0);
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
