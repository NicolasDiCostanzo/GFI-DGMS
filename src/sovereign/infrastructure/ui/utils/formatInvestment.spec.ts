import { describe, expect, it } from 'vitest';
import { formatInvestment } from './formatInvestment';
import { CASES } from './formatInvestment.spec.fixtures';

describe('formatInvestment', () => {
    it.each(CASES)('formats %s as "%s"', (value, expected) => {
        expect(formatInvestment(value)).toBe(expected);
    });
});
