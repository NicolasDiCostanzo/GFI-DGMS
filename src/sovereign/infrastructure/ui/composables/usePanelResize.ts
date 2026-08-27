import { onUnmounted, ref, type Ref } from 'vue';

export const MIN_PANEL_WIDTH = 320;

export function usePanelResize(
    containerRef: Ref<HTMLElement | null>,
    onWidthChange: (width: number) => void,
) {
    const isResizing = ref(false);

    function getMaxWidth(): number {
        const container = containerRef.value;
        const width = container?.getBoundingClientRect().width ?? 0;
        if (width <= 0) {
            return Number.POSITIVE_INFINITY;
        }
        return Math.max(Math.floor(width), MIN_PANEL_WIDTH);
    }

    function clamp(value: number): number {
        return Math.min(Math.max(value, MIN_PANEL_WIDTH), getMaxWidth());
    }

    function handleMove(event: MouseEvent): void {
        const container = containerRef.value;
        if (!container) {
            return;
        }
        onWidthChange(clamp(container.getBoundingClientRect().right - event.clientX));
    }

    function stopResize(): void {
        isResizing.value = false;
        window.removeEventListener('mousemove', handleMove);
        window.removeEventListener('mouseup', stopResize);
        window.removeEventListener('blur', stopResize);
    }

    function startResize(event: MouseEvent): void {
        if (event.button !== 0) {
            return;
        }
        isResizing.value = true;
        window.addEventListener('mousemove', handleMove);
        window.addEventListener('mouseup', stopResize);
        window.addEventListener('blur', stopResize);
    }

    onUnmounted(stopResize);

    return {
        isResizing,
        startResize,
        clamp,
        getMaxWidth,
    };
}
