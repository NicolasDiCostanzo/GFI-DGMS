import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, ref } from 'vue';
import { useMapDrag } from './useMapDrag';

type MapDragApi = ReturnType<typeof useMapDrag>;

class StubDOMPoint {
    constructor(
        private x: number,
        private y: number,
    ) {}

    matrixTransform(matrix: { a: number; b: number; c: number; d: number; e: number; f: number }) {
        return {
            x: this.x * matrix.a + this.y * matrix.c + matrix.e,
            y: this.x * matrix.b + this.y * matrix.d + matrix.f,
        };
    }
}

function createPointerEvent(
    type: string,
    pointerId: number,
    clientX: number,
    clientY: number,
): PointerEvent {
    const event = new Event(type);
    Object.assign(event, { pointerId, clientX, clientY, button: 0 });
    return event as unknown as PointerEvent;
}

function stubCoordinateConversion(element: SVGElement): void {
    const identityMatrix = {
        a: 1,
        b: 0,
        c: 0,
        d: 1,
        e: 0,
        f: 0,
        inverse: () => identityMatrix,
    };
    Object.defineProperty(element, 'getScreenCTM', {
        value: () => identityMatrix,
        configurable: true,
    });
}

function mountUseMapDrag() {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg') as SVGSVGElement;
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g') as SVGGElement;
    stubCoordinateConversion(svg);
    stubCoordinateConversion(group);

    const panTo = vi.fn();
    const getCurrentTranslate = vi.fn(() => ({ x: 0, y: 0 }));
    const zoomAtPoint = vi.fn();

    let api!: MapDragApi;
    const TestComponent = defineComponent({
        setup() {
            api = useMapDrag(ref(svg), ref(group), panTo, getCurrentTranslate, zoomAtPoint);
            return {};
        },
        template: '<div></div>',
    });
    mount(TestComponent);

    return { ...api, panTo, getCurrentTranslate, zoomAtPoint };
}

describe('useMapDrag', () => {
    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
        document.body.innerHTML = '';
    });

    it('keeps an active pinch when an untracked third pointer is released', () => {
        vi.stubGlobal('DOMPoint', StubDOMPoint);
        const harness = mountUseMapDrag();

        harness.handleDragStart(createPointerEvent('pointerdown', 1, 100, 100));
        harness.handleDragStart(createPointerEvent('pointerdown', 2, 200, 100));

        window.dispatchEvent(createPointerEvent('pointerup', 3, 300, 300));

        window.dispatchEvent(createPointerEvent('pointermove', 2, 300, 100));

        expect(harness.zoomAtPoint).toHaveBeenCalledWith({ x: 200, y: 100 }, 2);
    });

    it('ends the gesture when a tracked pointer is released', () => {
        vi.stubGlobal('DOMPoint', StubDOMPoint);
        const harness = mountUseMapDrag();

        harness.handleDragStart(createPointerEvent('pointerdown', 1, 100, 100));
        harness.handleDragStart(createPointerEvent('pointerdown', 2, 200, 100));

        window.dispatchEvent(createPointerEvent('pointerup', 2, 200, 100));

        window.dispatchEvent(createPointerEvent('pointermove', 2, 300, 100));

        expect(harness.zoomAtPoint).not.toHaveBeenCalled();
        expect(harness.isDragging.value).toBe(false);
    });
});
