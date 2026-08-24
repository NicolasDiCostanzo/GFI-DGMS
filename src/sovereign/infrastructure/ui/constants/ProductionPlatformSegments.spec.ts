import { describe, expect, it } from 'vitest';
import { getPlatformSegments } from './ProductionPlatformSegments';

describe('ProductionPlatformSegments', () => {
    describe('getPlatformSegments()', () => {
        it('returns null for unknown platform values', () => {
            expect(getPlatformSegments(['Completely unknown'])).toBeNull();
        });
    });
});
