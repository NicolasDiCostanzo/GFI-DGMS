import { onUnmounted, ref } from 'vue';

export const MIN_PANEL_WIDTH = 320;
export function getMaxPanelWidth(): number {
    const vw = typeof window !== 'undefined' ? window.innerWidth : 1200;
    return Math.max(Math.floor(vw), MIN_PANEL_WIDTH);
}

export function usePanelResize(onWidthChange: (width: number) => void) {
    const isResizing = ref(false);

    function clamp(value: number): number {
        const max = getMaxPanelWidth();
        return Math.min(Math.max(value, MIN_PANEL_WIDTH), max);
    }

    function handleMove(event: MouseEvent): void {
        onWidthChange(clamp(window.innerWidth - event.clientX));
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
    };
}
