import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { describe, expect, it } from 'vitest';
import { YieldCalculator } from './YieldCalculator';
import {
    ADDITIONAL_CO2_CASES,
    ADDITIONAL_JOBS_CASES,
    ADDITIONAL_YIELD_VALIDATION_CASES,
    FUNDING_PROGRESS_CASES,
    FUNDING_PROGRESS_VALIDATION_CASES,
} from './YieldCalculator.spec.fixtures';

describe('YieldCalculator', () => {
    describe('calculateFundingProgress()', () => {
        it.each(FUNDING_PROGRESS_CASES)('%s', (_title, investment, target, expected) => {
            expect(YieldCalculator.calculateFundingProgress(investment, target)).toBe(expected);
        });

        it.each(FUNDING_PROGRESS_VALIDATION_CASES)(
            'throws %s',
            (_title, investment, target, expected) => {
                expect(() => YieldCalculator.calculateFundingProgress(investment, target)).toThrow(
                    expected,
                );
            },
        );

        it('throws NonPositiveNumberException with descriptive message when target is zero', () => {
            expect.assertions(2);

            try {
                YieldCalculator.calculateFundingProgress(500, 0);
            } catch (error) {
                expect(error).toBeInstanceOf(NonPositiveNumberException);
                expect((error as NonPositiveNumberException).message).toContain(
                    'YieldCalculator target must be greater than 0',
                );
            }
        });

        it('throws InvalidNumberException with descriptive message when investment is NaN', () => {
            expect.assertions(2);

            try {
                YieldCalculator.calculateFundingProgress(NaN, 1000);
            } catch (error) {
                expect(error).toBeInstanceOf(InvalidNumberException);
                expect((error as InvalidNumberException).message).toContain(
                    'YieldCalculator investment must not be NaN',
                );
            }
        });

        it('is deterministic (same inputs produce same output)', () => {
            const result1 = YieldCalculator.calculateFundingProgress(750, 1000);
            const result2 = YieldCalculator.calculateFundingProgress(750, 1000);

            expect(result1).toBe(result2);
        });
    });

    describe('calculateAdditionalJobs()', () => {
        it.each(ADDITIONAL_JOBS_CASES)(
            '%s',
            (_title, investment, baseline, multiplier, expected) => {
                expect(
                    YieldCalculator.calculateAdditionalJobs(investment, baseline, multiplier),
                ).toBe(expected);
            },
        );

        it.each(ADDITIONAL_YIELD_VALIDATION_CASES)(
            'throws %s',
            (_title, investment, baseline, multiplier, expected) => {
                expect(() =>
                    YieldCalculator.calculateAdditionalJobs(investment, baseline, multiplier),
                ).toThrow(expected);
            },
        );

        it('is deterministic (same inputs produce same output)', () => {
            const result1 = YieldCalculator.calculateAdditionalJobs(750, 500, 8);
            const result2 = YieldCalculator.calculateAdditionalJobs(750, 500, 8);

            expect(result1).toBe(result2);
        });
    });

    describe('calculateAdditionalCO2()', () => {
        it.each(ADDITIONAL_CO2_CASES)(
            '%s',
            (_title, investment, baseline, multiplier, expected) => {
                expect(
                    YieldCalculator.calculateAdditionalCO2(investment, baseline, multiplier),
                ).toBe(expected);
            },
        );

        it.each(ADDITIONAL_YIELD_VALIDATION_CASES)(
            'throws %s',
            (_title, investment, baseline, multiplier, expected) => {
                expect(() =>
                    YieldCalculator.calculateAdditionalCO2(investment, baseline, multiplier),
                ).toThrow(expected);
            },
        );

        it('is deterministic (same inputs produce same output)', () => {
            const result1 = YieldCalculator.calculateAdditionalCO2(750, 500, 4);
            const result2 = YieldCalculator.calculateAdditionalCO2(750, 500, 4);

            expect(result1).toBe(result2);
        });
    });
});
