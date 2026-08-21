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

        it('activates only PB for plant-based values', () => {
            const segments = getPlatformSegments(['Plant-based']);
            expect(segments?.map((s) => s.active)).toEqual([true]);
        });

        it('treats near-duplicate plant-based spellings as PB only', () => {
            for (const value of ['Plant-based', 'Plant-based meat']) {
                expect(getPlatformSegments([value])?.map((s) => s.active)).toEqual([true]);
            }
        });

        it('activates only CM for cultivated', () => {
            expect(getPlatformSegments(['Cultivated'])?.map((s) => s.active)).toEqual([true]);
        });

        it('activates CM and FM for CM & FM', () => {
            expect(getPlatformSegments(['CM & FM'])?.map((s) => s.active)).toEqual([true, true]);
        });

        it('activates only FM for fermentation', () => {
            expect(getPlatformSegments(['Fermentation'])?.map((s) => s.active)).toEqual([true]);
        });

        it('activates PB and FM for PB & FM', () => {
            expect(getPlatformSegments(['PB & FM'])?.map((s) => s.active)).toEqual([true, true]);
        });

        it('activates all three segments for All', () => {
            expect(getPlatformSegments(['All'])?.map((s) => s.active)).toEqual([true, true, true]);
        });

        it('activates PB and CM for PB & CM', () => {
            expect(getPlatformSegments(['PB & CM'])?.map((s) => s.active)).toEqual([true, true]);
        });

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
