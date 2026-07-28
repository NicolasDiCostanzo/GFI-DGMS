import { computed, ref } from 'vue';

interface ZoomState {
    scale: number;
    translateX: number;
    translateY: number;
}

const MIN_ZOOM_SCALE = 1;
const MAX_WHEEL_ZOOM_SCALE = 20;

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

        isAnimated.value = false;
        zoomState.value = {
            scale,
            translateX: current.translateX + point.x * (current.scale - scale),
            translateY: current.translateY + point.y * (current.scale - scale),
        };
    }

    function panTo(translateX: number, translateY: number): void {
        isAnimated.value = false;
        zoomState.value = { ...zoomState.value, translateX, translateY };
    }

    return {
        zoomState,
        mapTransform,
        isAnimated,
        zoomAtPoint,
        panTo,
    };
}
