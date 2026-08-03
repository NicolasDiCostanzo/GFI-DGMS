import { describe, expect, it } from 'vitest';
import { co2TonnesToCarsEquivalent, formatCarsEquivalent } from './co2Equivalent';
import { CARS_FORMAT, TONNES_TO_CARS } from './co2Equivalent.spec.fixtures';

describe('co2Equivalent', () => {
    it.each(TONNES_TO_CARS)('converts %s tonnes to %s cars', (tonnes, expected) => {
        expect(co2TonnesToCarsEquivalent(tonnes)).toBe(expected);
    });

    it.each(CARS_FORMAT)('formats %s cars as "%s"', (cars, expected) => {
        expect(formatCarsEquivalent(cars)).toBe(expected);
    });
});
