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

    describe('zoomAtPoint', () => {
        it('zooms in around the given point, keeping it visually fixed', () => {
            const { mapTransform, zoomAtPoint } = useMapZoom(200, 200);

            zoomAtPoint({ x: 50, y: 25 }, 2);

            expect(mapTransform.value).toBe('translate(-50,-25) scale(2)');
        });

        it('zooms out around the given point, keeping it visually fixed', () => {
            const { mapTransform, zoomAtPoint } = useMapZoom(200, 200);

            zoomAtPoint({ x: 50, y: 25 }, 2);
            zoomAtPoint({ x: 50, y: 25 }, 0.5);

            expect(mapTransform.value).toBe('');
        });

        it('does not zoom out past the minimum scale', () => {
            const { mapTransform, zoomAtPoint } = useMapZoom(200, 200);

            zoomAtPoint({ x: 50, y: 25 }, 0.5);

            expect(mapTransform.value).toBe('');
        });

        it('clamps to the maximum wheel zoom scale', () => {
            const { mapTransform, zoomAtPoint } = useMapZoom(200, 200);

            zoomAtPoint({ x: 10, y: 5 }, 100);

            expect(mapTransform.value).toBe('translate(-190,-95) scale(20)');
        });
    });

    describe('panTo', () => {
        it('moves the translate without changing the scale', () => {
            const { mapTransform, panTo } = useMapZoom(200, 200);

            panTo(30, 15);

            expect(mapTransform.value).toBe('translate(30,15) scale(1)');
        });

        it('preserves the current scale when panning a zoomed-in map', () => {
            const { mapTransform, zoomAtPoint, panTo } = useMapZoom(200, 200);

            zoomAtPoint({ x: 50, y: 25 }, 2);
            panTo(10, 5);

            expect(mapTransform.value).toBe('translate(10,5) scale(2)');
        });
    });
});
