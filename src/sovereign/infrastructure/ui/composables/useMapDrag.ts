import { onUnmounted, ref, type Ref } from 'vue';

const DRAG_THRESHOLD_PX = 2;
const PANNABLE_BUTTONS = [0, 1];

interface DragState {
    pointerId: number;
    startClient: { x: number; y: number };
    startLocal: { x: number; y: number };
    startTranslate: { x: number; y: number };
}

interface PinchState {
    lastDistance: number;
}

export function useMapDrag(
    svgRef: Readonly<Ref<SVGSVGElement | null>>,
    groupRef: Readonly<Ref<SVGGElement | null>>,
    panTo: (x: number, y: number) => void,
    getCurrentTranslate: () => { x: number; y: number },
    zoomAtPoint: (point: { x: number; y: number }, factor: number) => void,
) {
    const isDragging = ref(false);
    let dragState: DragState | null = null;
    let pinchState: PinchState | null = null;
    let didDrag = false;
    const activePointers = new Map<number, { x: number; y: number }>();

    function clientToLocal(
        element: SVGGraphicsElement | null,
        clientX: number,
        clientY: number,
    ): { x: number; y: number } | null {
        const ctm = element?.getScreenCTM();
        if (!ctm) {
            return null;
        }
        const point = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
        return { x: point.x, y: point.y };
    }

    function toPanDeltaPoint(clientX: number, clientY: number): { x: number; y: number } | null {
        return clientToLocal(svgRef.value, clientX, clientY);
    }

    function toZoomAnchorPoint(clientX: number, clientY: number): { x: number; y: number } | null {
        return clientToLocal(groupRef.value, clientX, clientY);
    }

    function handlePinchMove(pinch: PinchState): void {
        const [first, second] = [...activePointers.values()];
        const distance = Math.hypot(second.x - first.x, second.y - first.y);
        if (distance === 0 || pinch.lastDistance === 0) {
            return;
        }
        const local = toZoomAnchorPoint((first.x + second.x) / 2, (first.y + second.y) / 2);
        if (!local) {
            return;
        }
        zoomAtPoint(local, distance / pinch.lastDistance);
        pinch.lastDistance = distance;
    }

    function handleDragMove(event: PointerEvent): void {
        if (!activePointers.has(event.pointerId)) {
            return;
        }
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });

        if (pinchState) {
            handlePinchMove(pinchState);
            return;
        }

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

        const local = toPanDeltaPoint(event.clientX, event.clientY);
        if (!local) {
            return;
        }
        panTo(
            dragState.startTranslate.x + (local.x - dragState.startLocal.x),
            dragState.startTranslate.y + (local.y - dragState.startLocal.y),
        );
    }

    function addDragListeners(): void {
        window.addEventListener('pointermove', handleDragMove);
        window.addEventListener('pointerup', handleDragEnd);
        window.addEventListener('pointercancel', handleDragEnd);
    }

    function removeDragListeners(): void {
        window.removeEventListener('pointermove', handleDragMove);
        window.removeEventListener('pointerup', handleDragEnd);
        window.removeEventListener('pointercancel', handleDragEnd);
    }

    function handleDragEnd(event: PointerEvent): void {
        if (!activePointers.has(event.pointerId)) {
            return;
        }
        activePointers.clear();
        dragState = null;
        pinchState = null;
        isDragging.value = false;
        removeDragListeners();
    }

    function beginPinch(): void {
        const [first, second] = [...activePointers.values()];
        dragState = null;
        isDragging.value = false;
        didDrag = true;
        pinchState = {
            lastDistance: Math.hypot(second.x - first.x, second.y - first.y),
        };
    }

    function handleDragStart(event: PointerEvent): void {
        if (activePointers.size >= 2 || !PANNABLE_BUTTONS.includes(event.button)) {
            return;
        }
        if (event.button === 1) {
            event.preventDefault();
        }
        activePointers.set(event.pointerId, { x: event.clientX, y: event.clientY });
        if (activePointers.size === 2) {
            beginPinch();
            return;
        }
        addDragListeners();

        const local = toPanDeltaPoint(event.clientX, event.clientY);
        if (!local) {
            return;
        }

        didDrag = false;
        const currentTranslate = getCurrentTranslate();
        dragState = {
            pointerId: event.pointerId,
            startClient: { x: event.clientX, y: event.clientY },
            startLocal: local,
            startTranslate: { x: currentTranslate.x, y: currentTranslate.y },
        };
        isDragging.value = true;
    }

    onUnmounted(removeDragListeners);

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
