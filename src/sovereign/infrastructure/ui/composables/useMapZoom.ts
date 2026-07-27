import { computed, ref } from 'vue';

interface ZoomState {
    scale: number;
    translateX: number;
    translateY: number;
}

const ZOOM_PADDING = 40;
const MAX_ZOOM_SCALE = 4;
const MIN_ZOOM_SCALE = 1;
const MAX_WHEEL_ZOOM_SCALE = 20;

export function useMapZoom(svgWidth: number, svgHeight: number) {
    const zoomState = ref<ZoomState>({ scale: 1, translateX: 0, translateY: 0 });

    const mapTransform = computed(() => {
        const z = zoomState.value;
        if (z.scale === 1 && z.translateX === 0 && z.translateY === 0) {
            return '';
        }
        return `translate(${z.translateX},${z.translateY}) scale(${z.scale})`;
    });

    function computeZoom(bounds: [[number, number], [number, number]]): void {
        const [[x0, y0], [x1, y1]] = bounds;
        const width = x1 - x0;
        const height = y1 - y0;

        const targetWidth = svgWidth - ZOOM_PADDING * 2;
        const targetHeight = svgHeight - ZOOM_PADDING * 2;

        const scale = Math.min(targetWidth / width, targetHeight / height, MAX_ZOOM_SCALE);
        const translateX = svgWidth / 2 - ((x0 + x1) / 2) * scale;
        const translateY = svgHeight / 2 - ((y0 + y1) / 2) * scale;

        zoomState.value = { scale, translateX, translateY };
    }

    function resetZoom(): void {
        zoomState.value = { scale: 1, translateX: 0, translateY: 0 };
    }

    function zoomAtPoint(point: { x: number; y: number }, factor: number): void {
        const current = zoomState.value;
        const scale = Math.min(
            Math.max(current.scale * factor, MIN_ZOOM_SCALE),
            MAX_WHEEL_ZOOM_SCALE,
        );

        zoomState.value = {
            scale,
            translateX: current.translateX + point.x * (current.scale - scale),
            translateY: current.translateY + point.y * (current.scale - scale),
        };
    }

    function panTo(translateX: number, translateY: number): void {
        zoomState.value = { ...zoomState.value, translateX, translateY };
    }

    return {
        zoomState,
        mapTransform,
        computeZoom,
        resetZoom,
        zoomAtPoint,
        panTo,
    };
}
