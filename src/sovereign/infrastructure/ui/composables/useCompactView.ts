import { onMounted, onUnmounted, ref, watch, type Ref } from 'vue';

export const COMPACT_VIEW_MAX_WIDTH = 599;

export function useCompactView(
    containerRef: Ref<HTMLElement | null>,
    maxWidth: number = COMPACT_VIEW_MAX_WIDTH,
): Ref<boolean> {
    const isCompact = ref(false);
    let observer: ResizeObserver | null = null;

    function handleResize(entries: ReadonlyArray<ResizeObserverEntry>): void {
        isCompact.value = entries[0].contentRect.width <= maxWidth;
    }

    function startObserving(): void {
        const container = containerRef.value;
        if (!container || typeof ResizeObserver === 'undefined') {
            return;
        }
        observer?.disconnect();
        observer = new ResizeObserver(handleResize);
        observer.observe(container);
    }

    onMounted(startObserving);
    watch(containerRef, startObserving);

    onUnmounted(() => {
        observer?.disconnect();
        observer = null;
    });

    return isCompact;
}
