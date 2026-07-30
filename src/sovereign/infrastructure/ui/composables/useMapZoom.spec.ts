import { describe, expect, it } from 'vitest';
import { useMapZoom } from './useMapZoom';
import {
    ZOOM_TRANSFORM_IDENTITY,
    ZOOM_TRANSFORM_MAX_ZOOM,
    ZOOM_TRANSFORM_PAN,
    ZOOM_TRANSFORM_PAN_AFTER_ZOOM,
    ZOOM_TRANSFORM_ZOOM_IN,
} from './useMapZoom.spec.fixture';

describe('useMapZoom', () => {
    it('starts with no transform', () => {
        const { mapTransform } = useMapZoom();
        expect(mapTransform.value).toBe(ZOOM_TRANSFORM_IDENTITY);
    });

    describe('zoomAtPoint', () => {
        it('zooms in around the given point, keeping it visually fixed', () => {
            const { mapTransform, zoomAtPoint } = useMapZoom();

            zoomAtPoint({ x: 50, y: 25 }, 2);

            expect(mapTransform.value).toBe(ZOOM_TRANSFORM_ZOOM_IN);
        });

        it('zooms out around the given point, keeping it visually fixed', () => {
            const { mapTransform, zoomAtPoint } = useMapZoom();

            zoomAtPoint({ x: 50, y: 25 }, 2);
            zoomAtPoint({ x: 50, y: 25 }, 0.5);

            expect(mapTransform.value).toBe(ZOOM_TRANSFORM_IDENTITY);
        });

        it('does not zoom out past the minimum scale', () => {
            const { mapTransform, zoomAtPoint } = useMapZoom();

            zoomAtPoint({ x: 50, y: 25 }, 0.5);

            expect(mapTransform.value).toBe(ZOOM_TRANSFORM_IDENTITY);
        });

        it('clamps to the maximum wheel zoom scale', () => {
            const { mapTransform, zoomAtPoint } = useMapZoom();

            zoomAtPoint({ x: 10, y: 5 }, 100);

            expect(mapTransform.value).toBe(ZOOM_TRANSFORM_MAX_ZOOM);
        });
    });

    describe('panTo', () => {
        it('moves the translate without changing the scale', () => {
            const { mapTransform, panTo } = useMapZoom();

            panTo(30, 15);

            expect(mapTransform.value).toBe(ZOOM_TRANSFORM_PAN);
        });

        it('preserves the current scale when panning a zoomed-in map', () => {
            const { mapTransform, zoomAtPoint, panTo } = useMapZoom();

            zoomAtPoint({ x: 50, y: 25 }, 2);
            panTo(10, 5);

            expect(mapTransform.value).toBe(ZOOM_TRANSFORM_PAN_AFTER_ZOOM);
        });
    });
});
