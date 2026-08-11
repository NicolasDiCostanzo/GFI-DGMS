import { describe, expect, it } from 'vitest';
import { calculateFundingColorThresholds } from './calculateFundingColorThresholds';
import { THRESHOLD_CASES } from './calculateFundingColorThresholds.spec.fixtures';

describe('calculateFundingColorThresholds', () => {
    it.each(THRESHOLD_CASES)('returns %s for %s', (_title, totals, expected) => {
        expect(calculateFundingColorThresholds(totals)).toEqual(expected);
    });
});
