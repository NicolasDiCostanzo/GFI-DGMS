import { describe, expect, it } from 'vitest';
import { formatInvestment } from './formatInvestment';

const CASES: ReadonlyArray<[number, string]> = [
    [900, '$900M'],
    [600, '$600M'],
    [1000, '$1B'],
    [250, '$250M'],
    [10, '$10M'],
    [1500, '$1.5B'],
    [1200, '$1.2B'],
    [0, '$0M'],
    [1, '$1M'],
];

describe('formatInvestment', () => {
    it.each(CASES)('formats %s as "%s"', (value, expected) => {
        expect(formatInvestment(value)).toBe(expected);
    });
});
