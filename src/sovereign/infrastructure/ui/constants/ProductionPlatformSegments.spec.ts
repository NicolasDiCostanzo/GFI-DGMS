import { describe, expect, it } from 'vitest';
import { getPlatformSegments } from './ProductionPlatformSegments';

describe('ProductionPlatformSegments', () => {
    describe('getPlatformSegments()', () => {
        it('returns null for an empty platform list', () => {
            expect(getPlatformSegments([])).toBeNull();
        });

        it.each([
            ['All', ['PB', 'CM', 'FM']],
            ['Fermentation', ['FM']],
            ['Cultivated', ['CM']],
            ['Plant-based', ['PB']],
        ] as const)(
            'returns only relevant segments for a single platform %s',
            (platform, labels) => {
                const segments = getPlatformSegments([platform]);
                expect(segments).not.toBeNull();
                expect(segments?.map((s) => s.label)).toEqual(labels);
            },
        );

        it('returns null for unknown platform values', () => {
            expect(getPlatformSegments(['Completely unknown'])).toBeNull();
        });

        it.each([
            ['Plant-based', ['PB'], [true]],
            ['Plant-Based', ['PB'], [true]],
            ['Plant-based meat', ['PB'], [true]],
            ['Cultivated', ['CM'], [true]],
            ['CM & FM', ['CM', 'FM'], [true, true]],
            ['Fermentation', ['FM'], [true]],
            ['PB & FM', ['PB', 'FM'], [true, true]],
            ['All', ['PB', 'CM', 'FM'], [true, true, true]],
            ['PB & CM', ['PB', 'CM'], [true, true]],
        ] as const)(
            'returns segments %s with labels %j and active states %j',
            (platform, labels, active) => {
                const segments = getPlatformSegments([platform]);
                expect(segments?.map((s) => s.label)).toEqual(labels);
                expect(segments?.map((s) => s.active)).toEqual(active);
            },
        );

        it('merges multiple platform values into one segment set', () => {
            expect(getPlatformSegments(['Cultivated', 'PB & FM'])?.map((s) => s.active)).toEqual([
                true,
                true,
                true,
            ]);
        });

        it('returns null when no value in a mixed list maps to a known segment', () => {
            expect(getPlatformSegments(['Unknown', 'Also unknown'])).toBeNull();
        });
    });
});
