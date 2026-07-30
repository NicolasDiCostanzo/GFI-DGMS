import { computed, ref } from 'vue';

interface ZoomState {
    scale: number;
    translateX: number;
    translateY: number;
}

const MIN_ZOOM_SCALE = 1;
const MAX_WHEEL_ZOOM_SCALE = 20;
const SVG_WIDTH = 960;
const SVG_HEIGHT = 500;

export function useMapZoom() {
    const zoomState = ref<ZoomState>({ scale: 1, translateX: 0, translateY: 0 });
    const isAnimated = ref(true);

    const mapTransform = computed(() => {
        const z = zoomState.value;
        if (z.scale === 1 && z.translateX === 0 && z.translateY === 0) {
            return '';
        }
        return `translate(${z.translateX},${z.translateY}) scale(${z.scale})`;
    });

    function zoomAtPoint(point: { x: number; y: number }, factor: number): void {
        const current = zoomState.value;
        const scale = Math.min(
            Math.max(current.scale * factor, MIN_ZOOM_SCALE),
            MAX_WHEEL_ZOOM_SCALE,
        );

        const translateX = current.translateX + point.x * (current.scale - scale);
        const translateY = current.translateY + point.y * (current.scale - scale);

        const maxTranslateX = SVG_WIDTH * (1 - scale);
        const maxTranslateY = SVG_HEIGHT * (1 - scale);
        const clampedX = scale > 1 ? Math.min(0, Math.max(translateX, maxTranslateX)) : translateX;
        const clampedY = scale > 1 ? Math.min(0, Math.max(translateY, maxTranslateY)) : translateY;

        isAnimated.value = false;
        zoomState.value = {
            scale,
            translateX: clampedX,
            translateY: clampedY,
        };
    }

    function panTo(translateX: number, translateY: number): void {
        isAnimated.value = false;
        const { scale } = zoomState.value;
        const maxTranslateX = SVG_WIDTH * (1 - scale);
        const maxTranslateY = SVG_HEIGHT * (1 - scale);
        const clampedX = scale > 1 ? Math.min(0, Math.max(translateX, maxTranslateX)) : translateX;
        const clampedY = scale > 1 ? Math.min(0, Math.max(translateY, maxTranslateY)) : translateY;
        zoomState.value = { ...zoomState.value, translateX: clampedX, translateY: clampedY };
    }

    return {
        zoomState,
        mapTransform,
        isAnimated,
        zoomAtPoint,
        panTo,
    };
}
