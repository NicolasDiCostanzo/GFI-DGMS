import { describe, expect, it } from 'vitest';
import { parseFundingEstimate } from './parseFundingEstimate.mjs';
import { FUNDING_ESTIMATE_CASES } from './parseFundingEstimate.spec.fixtures';

describe('parseFundingEstimate', () => {
    it.each(FUNDING_ESTIMATE_CASES)('returns the expected amount for %s', (_title, raw, expected) => {
        expect(parseFundingEstimate(raw)).toBe(expected);
    });
});
