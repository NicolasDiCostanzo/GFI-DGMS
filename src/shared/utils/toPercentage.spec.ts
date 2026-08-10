import { describe, expect, it } from 'vitest';
import { toPercentage } from './toPercentage';
import { PERCENTAGE_CASES } from './toPercentage.spec.fixtures';

describe('toPercentage', () => {
    it.each(PERCENTAGE_CASES)('%s', (_title, fraction, expected) => {
        expect(toPercentage(fraction)).toBe(expected);
    });
});
