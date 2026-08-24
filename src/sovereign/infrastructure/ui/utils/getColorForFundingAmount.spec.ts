import { describe, expect, it } from 'vitest';
import { MapColors } from '@/sovereign/domain/constants/MapColors';
import { getColorForFundingAmount } from './getColorForFundingAmount';

const THRESHOLDS = [20, 40, 60, 80];

describe('getColorForFundingAmount', () => {
    it('returns the "no data" color for zero', () => {
        expect(getColorForFundingAmount(0, THRESHOLDS)).toBe(MapColors.INACTIVE);
    });

    it('returns the "no data" color for a negative amount', () => {
        expect(getColorForFundingAmount(-5, THRESHOLDS)).toBe(MapColors.INACTIVE);
    });

    const BUCKET_CASES: ReadonlyArray<[amount: number, expectedColor: string]> = [
        [10, MapColors.RED],
        [30, MapColors.ORANGE],
        [50, MapColors.YELLOW_AMBER],
        [70, MapColors.GREEN],
        [90, MapColors.NEON_GREEN],
    ];

    it.each(BUCKET_CASES)('buckets an amount of %s into %s', (amount, expectedColor) => {
        expect(getColorForFundingAmount(amount, THRESHOLDS)).toBe(expectedColor);
    });
});
