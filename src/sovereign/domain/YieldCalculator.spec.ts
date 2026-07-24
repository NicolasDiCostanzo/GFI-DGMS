import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { describe, expect, it } from 'vitest';
import { YieldCalculator } from './YieldCalculator';

describe('YieldCalculator', () => {
    describe('calculateFundingProgress()', () => {
        it('returns 0.0 when investment is zero', () => {
            expect(YieldCalculator.calculateFundingProgress(0, 1000)).toBe(0);
        });

        it('returns 1.0 when investment equals the target', () => {
            expect(YieldCalculator.calculateFundingProgress(1000, 1000)).toBe(1);
        });

        it('returns 0.5 when investment is half the target', () => {
            expect(YieldCalculator.calculateFundingProgress(500, 1000)).toBe(0.5);
        });

        it('returns 1.5 when investment is 150% of the target', () => {
            expect(YieldCalculator.calculateFundingProgress(1500, 1000)).toBe(1.5);
        });

        it('clamps to 2.0 when investment is double the target', () => {
            expect(YieldCalculator.calculateFundingProgress(2000, 1000)).toBe(2);
        });

        it('clamps to 2.0 when investment exceeds double the target', () => {
            expect(YieldCalculator.calculateFundingProgress(3000, 1000)).toBe(2);
        });

        it('clamps to 0.0 when investment is negative', () => {
            expect(YieldCalculator.calculateFundingProgress(-500, 1000)).toBe(0);
        });

        it('clamps to 0.0 when investment is negative and larger in magnitude than target', () => {
            expect(YieldCalculator.calculateFundingProgress(-5000, 1000)).toBe(0);
        });

        it('throws NonPositiveNumberException when target is zero', () => {
            expect(() => YieldCalculator.calculateFundingProgress(500, 0)).toThrow(
                NonPositiveNumberException,
            );
        });

        it('throws NonPositiveNumberException with descriptive message when target is zero', () => {
            expect(() => YieldCalculator.calculateFundingProgress(500, 0)).toThrow(
                'YieldCalculator target must be greater than 0',
            );
        });

        it('throws NonPositiveNumberException when target is negative', () => {
            expect(() => YieldCalculator.calculateFundingProgress(500, -100)).toThrow(
                NonPositiveNumberException,
            );
        });

        it('throws InvalidNumberException when investment is NaN', () => {
            expect(() => YieldCalculator.calculateFundingProgress(NaN, 1000)).toThrow(
                InvalidNumberException,
            );
        });

        it('throws InvalidNumberException with descriptive message when investment is NaN', () => {
            expect(() => YieldCalculator.calculateFundingProgress(NaN, 1000)).toThrow(
                'YieldCalculator investment must not be NaN',
            );
        });

        it('throws InfiniteNumberException when investment is Infinity', () => {
            expect(() => YieldCalculator.calculateFundingProgress(Infinity, 1000)).toThrow(
                InfiniteNumberException,
            );
        });

        it('throws InfiniteNumberException when investment is -Infinity', () => {
            expect(() => YieldCalculator.calculateFundingProgress(-Infinity, 1000)).toThrow(
                InfiniteNumberException,
            );
        });

        it('throws InvalidNumberException when target is NaN', () => {
            expect(() => YieldCalculator.calculateFundingProgress(500, NaN)).toThrow(
                InvalidNumberException,
            );
        });

        it('throws InfiniteNumberException when target is Infinity', () => {
            expect(() => YieldCalculator.calculateFundingProgress(500, Infinity)).toThrow(
                InfiniteNumberException,
            );
        });

        it('throws InfiniteNumberException when target is -Infinity', () => {
            expect(() => YieldCalculator.calculateFundingProgress(500, -Infinity)).toThrow(
                InfiniteNumberException,
            );
        });

        it('is deterministic (same inputs produce same output)', () => {
            const result1 = YieldCalculator.calculateFundingProgress(750, 1000);
            const result2 = YieldCalculator.calculateFundingProgress(750, 1000);

            expect(result1).toBe(result2);
        });
    });

    describe('calculateAdditionalJobs()', () => {
        it('returns 0 when investment equals baseline', () => {
            expect(YieldCalculator.calculateAdditionalJobs(500, 500, 10)).toBe(0);
        });

        it('returns a positive integer when investment exceeds baseline', () => {
            expect(YieldCalculator.calculateAdditionalJobs(1000, 500, 10)).toBe(5000);
        });

        it('returns a negative integer when investment is below baseline (funding deficit)', () => {
            expect(YieldCalculator.calculateAdditionalJobs(0, 500, 10)).toBe(-5000);
        });

        it('returns a negative integer when investment is zero (funding deficit edge case)', () => {
            expect(YieldCalculator.calculateAdditionalJobs(0, 1000, 5)).toBe(-5000);
        });

        it('rounds to the nearest whole number when the raw result is fractional', () => {
            expect(YieldCalculator.calculateAdditionalJobs(501, 500, 0.5)).toBe(1);
        });

        it('rounds .5 up to the nearest whole number', () => {
            expect(YieldCalculator.calculateAdditionalJobs(501, 500, 1.5)).toBe(2);
        });

        it('rounds a large fractional result correctly', () => {
            expect(YieldCalculator.calculateAdditionalJobs(1001, 500, 0.33)).toBe(165);
        });

        it('returns 0 when multiplier is zero regardless of delta', () => {
            expect(YieldCalculator.calculateAdditionalJobs(1000, 500, 0)).toBe(0);
        });

        it('returns a negative integer when delta is negative and multiplier is decimal', () => {
            expect(YieldCalculator.calculateAdditionalJobs(498, 500, 2.5)).toBe(-5);
        });

        it('throws InvalidNumberException when investment is NaN', () => {
            expect(() => YieldCalculator.calculateAdditionalJobs(NaN, 500, 10)).toThrow(
                InvalidNumberException,
            );
        });

        it('throws InfiniteNumberException when investment is Infinity', () => {
            expect(() => YieldCalculator.calculateAdditionalJobs(Infinity, 500, 10)).toThrow(
                InfiniteNumberException,
            );
        });

        it('throws InvalidNumberException when baseline is NaN', () => {
            expect(() => YieldCalculator.calculateAdditionalJobs(500, NaN, 10)).toThrow(
                InvalidNumberException,
            );
        });

        it('throws InfiniteNumberException when baseline is Infinity', () => {
            expect(() => YieldCalculator.calculateAdditionalJobs(500, Infinity, 10)).toThrow(
                InfiniteNumberException,
            );
        });

        it('throws InvalidNumberException when multiplier is NaN', () => {
            expect(() => YieldCalculator.calculateAdditionalJobs(500, 500, NaN)).toThrow(
                InvalidNumberException,
            );
        });

        it('throws InfiniteNumberException when multiplier is Infinity', () => {
            expect(() => YieldCalculator.calculateAdditionalJobs(500, 500, Infinity)).toThrow(
                InfiniteNumberException,
            );
        });

        it('throws InfiniteNumberException when multiplier is -Infinity', () => {
            expect(() => YieldCalculator.calculateAdditionalJobs(500, 500, -Infinity)).toThrow(
                InfiniteNumberException,
            );
        });

        it('is deterministic (same inputs produce same output)', () => {
            const result1 = YieldCalculator.calculateAdditionalJobs(750, 500, 8);
            const result2 = YieldCalculator.calculateAdditionalJobs(750, 500, 8);

            expect(result1).toBe(result2);
        });
    });

    describe('calculateAdditionalCO2()', () => {
        it('returns 0 when investment equals baseline', () => {
            expect(YieldCalculator.calculateAdditionalCO2(500, 500, 5)).toBe(0);
        });

        it('returns a positive number when investment exceeds baseline', () => {
            expect(YieldCalculator.calculateAdditionalCO2(1000, 500, 5)).toBe(2500);
        });

        it('returns a negative number when investment is below baseline (funding deficit)', () => {
            expect(YieldCalculator.calculateAdditionalCO2(250, 500, 5)).toBe(-1250);
        });

        it('returns a negative number when investment is zero (funding deficit edge case)', () => {
            expect(YieldCalculator.calculateAdditionalCO2(0, 1000, 3)).toBe(-3000);
        });

        it('returns a decimal value when the multiplier produces one', () => {
            expect(YieldCalculator.calculateAdditionalCO2(1000, 500, 0.75)).toBe(375);
        });

        it('returns a fractional decimal when delta and multiplier produce one', () => {
            expect(YieldCalculator.calculateAdditionalCO2(1001, 500, 0.33)).toBe(165.33);
        });

        it('returns 0 when multiplier is zero regardless of delta', () => {
            expect(YieldCalculator.calculateAdditionalCO2(1000, 500, 0)).toBe(0);
        });

        it('throws InvalidNumberException when investment is NaN', () => {
            expect(() => YieldCalculator.calculateAdditionalCO2(NaN, 500, 5)).toThrow(
                InvalidNumberException,
            );
        });

        it('throws InfiniteNumberException when investment is Infinity', () => {
            expect(() => YieldCalculator.calculateAdditionalCO2(Infinity, 500, 5)).toThrow(
                InfiniteNumberException,
            );
        });

        it('throws InvalidNumberException when baseline is NaN', () => {
            expect(() => YieldCalculator.calculateAdditionalCO2(500, NaN, 5)).toThrow(
                InvalidNumberException,
            );
        });

        it('throws InfiniteNumberException when baseline is Infinity', () => {
            expect(() => YieldCalculator.calculateAdditionalCO2(500, Infinity, 5)).toThrow(
                InfiniteNumberException,
            );
        });

        it('throws InvalidNumberException when multiplier is NaN', () => {
            expect(() => YieldCalculator.calculateAdditionalCO2(500, 500, NaN)).toThrow(
                InvalidNumberException,
            );
        });

        it('throws InfiniteNumberException when multiplier is Infinity', () => {
            expect(() => YieldCalculator.calculateAdditionalCO2(500, 500, Infinity)).toThrow(
                InfiniteNumberException,
            );
        });

        it('throws InfiniteNumberException when multiplier is -Infinity', () => {
            expect(() => YieldCalculator.calculateAdditionalCO2(500, 500, -Infinity)).toThrow(
                InfiniteNumberException,
            );
        });

        it('is deterministic (same inputs produce same output)', () => {
            const result1 = YieldCalculator.calculateAdditionalCO2(750, 500, 4);
            const result2 = YieldCalculator.calculateAdditionalCO2(750, 500, 4);

            expect(result1).toBe(result2);
        });
    });
});
