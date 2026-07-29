import { describe, expect, it } from 'vitest';
import { toPercentage } from './toPercentage';

describe('toPercentage', () => {
    it('converts a fraction to a rounded percentage', () => {
        expect(toPercentage(0.5)).toBe(50);
    });

    it('rounds to the nearest whole percentage', () => {
        expect(toPercentage(0.756)).toBe(76);
    });

    it('handles values above 1', () => {
        expect(toPercentage(1.2)).toBe(120);
    });

    it('handles zero', () => {
        expect(toPercentage(0)).toBe(0);
    });
});
