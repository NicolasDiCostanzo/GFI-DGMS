import { describe, expect, it } from 'vitest';
import { getFundingProgressColors } from './MapColors';
import { FUNDING_PROGRESS_COLORS_CASES } from './MapColors.spec.fixtures';

describe('MapColors', () => {
    describe('getFundingProgressColors()', () => {
        it.each(FUNDING_PROGRESS_COLORS_CASES)(
            'returns the correct palette for %s mode',
            (mode, expected) => {
                expect(getFundingProgressColors(mode)).toEqual(expected);
            },
        );
    });
});
