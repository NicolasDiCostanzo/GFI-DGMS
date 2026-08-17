import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getMaxPanelWidth, MIN_PANEL_WIDTH, usePanelResize } from './usePanelResize';

describe('usePanelResize', () => {
    let originalInnerWidth: number;

    beforeEach(() => {
        originalInnerWidth = window.innerWidth;
    });

    afterEach(() => {
        window.dispatchEvent(new MouseEvent('mouseup'));
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalInnerWidth,
        });
    });

    it('exposes min width constant and a computed max width', () => {
        expect(MIN_PANEL_WIDTH).toBe(320);
        const max = getMaxPanelWidth();
        expect(max).toBeGreaterThanOrEqual(MIN_PANEL_WIDTH);
    });

    it('clamps values to the min/max range', () => {
        const { clamp } = usePanelResize(vi.fn());

        const max = getMaxPanelWidth();
        expect(clamp(100)).toBe(MIN_PANEL_WIDTH);
        expect(clamp(1000)).toBeLessThanOrEqual(max);
        expect(clamp(400)).toBe(400);
    });

    it('ignores non-primary button presses', () => {
        const onWidthChange = vi.fn();
        const { startResize, isResizing } = usePanelResize(onWidthChange);

        const callsBefore = onWidthChange.mock.calls.length;
        startResize({ button: 1 } as MouseEvent);
        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 600 }));

        expect(isResizing.value).toBe(false);
        expect(onWidthChange.mock.calls.length).toBe(callsBefore);
    });

    it('starts resizing on primary button and updates width on move', () => {
        const onWidthChange = vi.fn();
        const { startResize, isResizing } = usePanelResize(onWidthChange);
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        startResize({ button: 0 } as MouseEvent);
        expect(isResizing.value).toBe(true);

        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 600 }));
        expect(onWidthChange).toHaveBeenCalledWith(1024 - 600);
    });

    it('clamps the width during resize', () => {
        const onWidthChange = vi.fn();
        const { startResize } = usePanelResize(onWidthChange);
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        const max = getMaxPanelWidth();
        startResize({ button: 0 } as MouseEvent);
        const clientX = 100;
        window.dispatchEvent(new MouseEvent('mousemove', { clientX }));
        const expectedWidth = Math.min(window.innerWidth - clientX, max);
        expect(onWidthChange).toHaveBeenCalledWith(expectedWidth);
    });

    it('stops resizing on mouseup and removes listeners', () => {
        const onWidthChange = vi.fn();
        const { startResize, isResizing } = usePanelResize(onWidthChange);
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024,
        });

        startResize({ button: 0 } as MouseEvent);
        expect(isResizing.value).toBe(true);

        window.dispatchEvent(new MouseEvent('mouseup'));
        expect(isResizing.value).toBe(false);

        window.dispatchEvent(new MouseEvent('mousemove', { clientX: 500 }));
        expect(onWidthChange).not.toHaveBeenCalled();
    });

    it('uses fallback viewport width when window is undefined', () => {
        const globalObj = globalThis as unknown as Record<string, unknown>;
        const realWindow = globalObj['window'];
        try {
            delete globalObj['window'];
            const val = getMaxPanelWidth();
            expect(val).toBe(1200);
        } finally {
            globalObj['window'] = realWindow;
        }
    });
});
