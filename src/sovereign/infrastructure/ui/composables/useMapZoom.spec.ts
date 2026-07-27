import { describe, expect, it } from 'vitest';
import { useMapZoom } from './useMapZoom';

describe('useMapZoom', () => {
    it('starts with no transform', () => {
        const { mapTransform } = useMapZoom(200, 200);
        expect(mapTransform.value).toBe('');
    });

    it('computes a translate/scale transform centered on the given bounds', () => {
        const { mapTransform, computeZoom } = useMapZoom(200, 200);

        computeZoom([
            [0, 0],
            [40, 20],
        ]);

        expect(mapTransform.value).toBe('translate(40,70) scale(3)');
    });

    it('clamps the scale to the maximum zoom level for very small bounds', () => {
        const { mapTransform, computeZoom } = useMapZoom(200, 200);

        computeZoom([
            [0, 0],
            [10, 10],
        ]);

        expect(mapTransform.value).toBe('translate(80,80) scale(4)');
    });

    it('resets the transform back to identity', () => {
        const { mapTransform, computeZoom, resetZoom } = useMapZoom(200, 200);

        computeZoom([
            [0, 0],
            [40, 20],
        ]);
        resetZoom();

        expect(mapTransform.value).toBe('');
    });
});
