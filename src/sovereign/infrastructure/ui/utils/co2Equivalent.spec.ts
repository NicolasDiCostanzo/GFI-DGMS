import { describe, expect, it } from 'vitest';
import { co2TonnesToCarsEquivalent, formatCarsEquivalent } from './co2Equivalent';

const TONNES_TO_CARS: ReadonlyArray<[number, number]> = [
    [1250, 272],
    [0, 0],
    [4600, 1000],
    [950, 207],
    [4.6, 1],
    [1.0, 0],
];

const CARS_FORMAT: ReadonlyArray<[number, string]> = [
    [272, '272 cars off the road'],
    [1000, '1,000 cars off the road'],
    [0, '0 cars off the road'],
    [12500, '12,500 cars off the road'],
];

describe('co2Equivalent', () => {
    it.each(TONNES_TO_CARS)('converts %s tonnes to %s cars', (tonnes, expected) => {
        expect(co2TonnesToCarsEquivalent(tonnes)).toBe(expected);
    });

    it.each(CARS_FORMAT)('formats %s cars as "%s"', (cars, expected) => {
        expect(formatCarsEquivalent(cars)).toBe(expected);
    });
});
