import { describe, expect, it } from 'vitest';
import { getFundingProgressColors, toRGB } from './MapColors';
import { FUNDING_PROGRESS_COLORS_CASES, TO_RGB_CASES } from './MapColors.spec.fixtures';

describe('MapColors', () => {
    describe('toRGB', () => {
        it.each(TO_RGB_CASES)('converts %s to %s', (hex, expected) => {
            expect(toRGB(hex)).toBe(expected);
        });
    });

    describe('getFundingProgressColors()', () => {
        it.each(FUNDING_PROGRESS_COLORS_CASES)(
            'returns the correct palette for %s mode',
            (mode, expected) => {
                expect(getFundingProgressColors(mode)).toEqual(expected);
            },
        );
    });
});
