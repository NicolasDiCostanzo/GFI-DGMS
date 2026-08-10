import { describe, expect, it } from 'vitest';
import { getColorForFundingProgress, getFundingProgressColors, toRGB } from './MapColors';
import {
    FUNDING_PROGRESS_COLOR_CASES,
    FUNDING_PROGRESS_COLORS_CASES,
    FUNDING_PROGRESS_MODE_CASES,
    TO_RGB_CASES,
} from './MapColors.spec.fixtures';

describe('MapColors', () => {
    describe('getColorForFundingProgress()', () => {
        it.each(FUNDING_PROGRESS_COLOR_CASES)('%s', (_title, fundingProgress, expected) => {
            expect(getColorForFundingProgress(fundingProgress)).toBe(expected);
        });
    });

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

    describe('getColorForFundingProgress() with theme mode', () => {
        it.each(FUNDING_PROGRESS_MODE_CASES)(
            'returns correct color for %s mode',
            (mode, expected) => {
                expect(getColorForFundingProgress(0.75, mode)).toBe(expected);
            },
        );
    });
});
