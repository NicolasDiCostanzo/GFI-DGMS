import { onUnmounted, ref, type Ref } from 'vue';

const DRAG_THRESHOLD_PX = 2;
const PANNABLE_BUTTONS = [0, 1];

interface DragState {
    startClient: { x: number; y: number };
    startLocal: { x: number; y: number };
    startTranslate: { x: number; y: number };
}

export function useMapDrag(
    svgRef: Readonly<Ref<SVGSVGElement | null>>,
    panTo: (x: number, y: number) => void,
    getCurrentTranslate: () => { x: number; y: number },
) {
    const isDragging = ref(false);
    let dragState: DragState | null = null;
    let didDrag = false;

    function toLocalPoint(clientX: number, clientY: number): { x: number; y: number } | null {
        const ctm = svgRef.value?.getScreenCTM();
        if (!ctm) {
            return null;
        }
        const point = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
        return { x: point.x, y: point.y };
    }

    function handleDragMove(event: MouseEvent): void {
        /* istanbul ignore next -- this listener is only attached between handleDragStart and
           handleDragEnd, which always set/clear these together; unreachable via the DOM */
        if (!dragState) {
            return;
        }

        if (!didDrag) {
            const distance = Math.hypot(
                event.clientX - dragState.startClient.x,
                event.clientY - dragState.startClient.y,
            );
            didDrag = distance > DRAG_THRESHOLD_PX;
        }

        const local = toLocalPoint(event.clientX, event.clientY);
        if (!local) {
            return;
        }
        panTo(
            dragState.startTranslate.x + (local.x - dragState.startLocal.x),
            dragState.startTranslate.y + (local.y - dragState.startLocal.y),
        );
    }

    function handleDragEnd(): void {
        isDragging.value = false;
        dragState = null;
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
    }

    function handleDragStart(event: MouseEvent): void {
        if (!PANNABLE_BUTTONS.includes(event.button)) {
            return;
        }
        if (event.button === 1) {
            event.preventDefault();
        }
        const local = toLocalPoint(event.clientX, event.clientY);
        if (!local) {
            return;
        }

        didDrag = false;
        const currentTranslate = getCurrentTranslate();
        dragState = {
            startClient: { x: event.clientX, y: event.clientY },
            startLocal: local,
            startTranslate: { x: currentTranslate.x, y: currentTranslate.y },
        };
        isDragging.value = true;
        window.addEventListener('mousemove', handleDragMove);
        window.addEventListener('mouseup', handleDragEnd);
    }

    onUnmounted(() => {
        window.removeEventListener('mousemove', handleDragMove);
        window.removeEventListener('mouseup', handleDragEnd);
    });

    function didDragOccur(): boolean {
        return didDrag;
    }

    function resetDidDrag(): void {
        didDrag = false;
    }

    return {
        isDragging,
        handleDragStart,
        didDragOccur,
        resetDidDrag,
    };
}
