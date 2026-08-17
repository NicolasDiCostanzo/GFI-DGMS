import { afterEach, describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';
import { MIN_PANEL_WIDTH, usePanelResize } from './usePanelResize';

function createContainerRef(rect: Pick<DOMRect, 'width' | 'right'>) {
    const el = document.createElement('div');
    vi.spyOn(el, 'getBoundingClientRect').mockReturnValue(rect as DOMRect);
    return ref<HTMLElement | null>(el);
}

describe('usePanelResize', () => {
    afterEach(() => {
        window.dispatchEvent(new MouseEvent('mouseup'));
    });

    it('exposes the min width constant and a container-based max width', () => {
        const containerRef = createContainerRef({ width: 1024, right: 1024 });
        const { getMaxWidth } = usePanelResize(containerRef, vi.fn());

        expect(MIN_PANEL_WIDTH).toBe(320);
        expect(getMaxWidth()).toBe(1024);
    });

    it('does not cap the max width when the container is not mounted yet', () => {
        const containerRef = ref<HTMLElement | null>(null);
        const { getMaxWidth, clamp } = usePanelResize(containerRef, vi.fn());

        expect(getMaxWidth()).toBe(Number.POSITIVE_INFINITY);
        expect(clamp(1000)).toBe(1000);
        expect(clamp(100)).toBe(MIN_PANEL_WIDTH);
    });

    it('clamps values to the container-relative min/max range', () => {
        const containerRef = createContainerRef({ width: 1024, right: 1024 });
        const { clamp } = usePanelResize(containerRef, vi.fn());

        expect(clamp(100)).toBe(MIN_PANEL_WIDTH);
        expect(clamp(2000)).toBe(1024);
        expect(clamp(400)).toBe(400);
    });

    it('ignores non-primary button presses', () => {
        const containerRef = createContainerRef({ width: 1024, right: 1024 });
        const onWidthChange = vi.fn();
        const { startResize, isResizing } = usePanelResize(containerRef, onWidthChange);

        const callsBefore = onWidthChange.mock.calls.length;
        startResize({ button: 1 } as MouseEvent);
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 600 }));

        expect(isResizing.value).toBe(false);
        expect(onWidthChange.mock.calls.length).toBe(callsBefore);
    });

    it('starts resizing on primary button and updates width relative to the container right edge', () => {
        const containerRef = createContainerRef({ width: 1024, right: 1024 });
        const onWidthChange = vi.fn();
        const { startResize, isResizing } = usePanelResize(containerRef, onWidthChange);

        startResize({ button: 0 } as MouseEvent);
        expect(isResizing.value).toBe(true);

        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 600 }));
        expect(onWidthChange).toHaveBeenCalledWith(1024 - 600);
    });

    it('does not update the width when the container is unmounted during resize', () => {
        const containerRef = createContainerRef({ width: 1024, right: 1024 });
        const onWidthChange = vi.fn();
        const { startResize } = usePanelResize(containerRef, onWidthChange);

        startResize({ button: 0 } as MouseEvent);
        containerRef.value = null;
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 600 }));

        expect(onWidthChange).not.toHaveBeenCalled();
    });

    it('computes width from the container edge, not the window edge, when the frame sits away from the window edge', () => {
        // The embed frame's right edge is at 500px inside a much wider window.
        const containerRef = createContainerRef({ width: 400, right: 500 });
        const onWidthChange = vi.fn();
        const { startResize } = usePanelResize(containerRef, onWidthChange);

        startResize({ button: 0 } as MouseEvent);
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 150 }));

        expect(onWidthChange).toHaveBeenCalledWith(350);
    });

    it('clamps the width during resize to the container width', () => {
        const containerRef = createContainerRef({ width: 1024, right: 1024 });
        const onWidthChange = vi.fn();
        const { startResize } = usePanelResize(containerRef, onWidthChange);

        startResize({ button: 0 } as MouseEvent);
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: -500 }));
        expect(onWidthChange).toHaveBeenCalledWith(1024);
    });

    it('stops resizing on mouseup and removes listeners', () => {
        const containerRef = createContainerRef({ width: 1024, right: 1024 });
        const onWidthChange = vi.fn();
        const { startResize, isResizing } = usePanelResize(containerRef, onWidthChange);

        startResize({ button: 0 } as MouseEvent);
        expect(isResizing.value).toBe(true);

        window.dispatchEvent(new MouseEvent('mouseup'));
        expect(isResizing.value).toBe(false);

        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 500 }));
        expect(onWidthChange).not.toHaveBeenCalled();
    });
});
