import { describe, expect, it } from 'vitest';
import { getColorForFundingProgress, MapColors } from './MapColors';

describe('MapColors', () => {
    describe('getColorForFundingProgress()', () => {
        it('returns RED when fundingProgress is below 0.5', () => {
            expect(getColorForFundingProgress(0)).toBe(MapColors.RED);
            expect(getColorForFundingProgress(0.25)).toBe(MapColors.RED);
            expect(getColorForFundingProgress(0.49)).toBe(MapColors.RED);
        });

        it('returns ORANGE when fundingProgress is exactly 0.5', () => {
            expect(getColorForFundingProgress(0.5)).toBe(MapColors.ORANGE);
        });

        it('returns ORANGE when fundingProgress is between 0.5 and 0.8', () => {
            expect(getColorForFundingProgress(0.6)).toBe(MapColors.ORANGE);
            expect(getColorForFundingProgress(0.79)).toBe(MapColors.ORANGE);
        });

        it('returns YELLOW_AMBER when fundingProgress is exactly 0.8', () => {
            expect(getColorForFundingProgress(0.8)).toBe(MapColors.YELLOW_AMBER);
        });

        it('returns YELLOW_AMBER when fundingProgress is between 0.8 and 1.0', () => {
            expect(getColorForFundingProgress(0.9)).toBe(MapColors.YELLOW_AMBER);
            expect(getColorForFundingProgress(0.99)).toBe(MapColors.YELLOW_AMBER);
        });

        it('returns GREEN when fundingProgress is exactly 1.0', () => {
            expect(getColorForFundingProgress(1.0)).toBe(MapColors.GREEN);
        });

        it('returns GREEN when fundingProgress is between 1.0 and 1.2', () => {
            expect(getColorForFundingProgress(1.1)).toBe(MapColors.GREEN);
            expect(getColorForFundingProgress(1.19)).toBe(MapColors.GREEN);
        });

        it('returns NEON_GREEN when fundingProgress is exactly 1.2', () => {
            expect(getColorForFundingProgress(1.2)).toBe(MapColors.NEON_GREEN);
        });

        it('returns NEON_GREEN when fundingProgress exceeds 1.2', () => {
            expect(getColorForFundingProgress(2.0)).toBe(MapColors.NEON_GREEN);
        });
    });
});
