import { describe, expect, it } from 'vitest';
import { getColorForFundingProgress, MapColors, toRGB } from './MapColors';

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

    describe('toRGB', () => {
        it('converts hex color to RGB format', () => {
            expect(toRGB(MapColors.RED)).toBe('rgb(211, 47, 47)');
            expect(toRGB(MapColors.ORANGE)).toBe('rgb(245, 124, 0)');
            expect(toRGB(MapColors.YELLOW_AMBER)).toBe('rgb(253, 216, 53)');
            expect(toRGB(MapColors.GREEN)).toBe('rgb(76, 175, 80)');
            expect(toRGB(MapColors.NEON_GREEN)).toBe('rgb(0, 230, 118)');
            expect(toRGB(MapColors.INACTIVE)).toBe('rgb(204, 204, 204)');
            expect(toRGB(MapColors.SELECTION)).toBe('rgb(33, 150, 243)');
            expect(toRGB(MapColors.OCEAN)).toBe('rgb(232, 244, 248)');
            expect(toRGB(MapColors.BORDER)).toBe('rgb(0, 0, 0)');
        });
    });
});
