import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, h, nextTick, ref } from 'vue';
import { COMPACT_VIEW_MAX_WIDTH, useCompactView } from './useCompactView';

type ResizeCallback = (entries: Array<{ contentRect: { width: number } }>) => void;

const observers: Array<{ callback: ResizeCallback; fire: (width: number) => void }> = [];

class MockResizeObserver {
    constructor(callback: ResizeCallback) {
        observers.push({
            callback,
            fire: (width: number) => {
                callback([{ contentRect: { width } }]);
            },
        });
    }

    observe(): void {}

    disconnect(): void {}

    unobserve(): void {}
}

function mountWithContainer(maxWidth?: number) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const containerRef = ref<HTMLElement | null>(container);
    let isCompact!: ReturnType<typeof useCompactView>;
    const wrapper = mount(
        defineComponent({
            setup() {
                isCompact = useCompactView(containerRef, maxWidth);
                return () => h('div');
            },
        }),
    );
    return { wrapper, containerRef, isCompact };
}

describe('useCompactView', () => {
    afterEach(() => {
        observers.length = 0;
        vi.unstubAllGlobals();
        document.body.innerHTML = '';
    });

    it('starts expanded and flips to compact when the container narrows past the breakpoint', async () => {
        vi.stubGlobal('ResizeObserver', MockResizeObserver);
        const { wrapper, isCompact } = mountWithContainer();

        expect(isCompact.value).toBe(false);

        observers[0].fire(COMPACT_VIEW_MAX_WIDTH);
        await nextTick();
        expect(isCompact.value).toBe(true);

        observers[0].fire(COMPACT_VIEW_MAX_WIDTH + 1);
        await nextTick();
        expect(isCompact.value).toBe(false);

        wrapper.unmount();
    });

    it('disconnects the observer on unmount', () => {
        vi.stubGlobal('ResizeObserver', MockResizeObserver);
        const disconnectSpy = vi.spyOn(MockResizeObserver.prototype, 'disconnect');
        const { wrapper } = mountWithContainer();

        wrapper.unmount();

        expect(disconnectSpy).toHaveBeenCalledTimes(1);
    });

    it('leaves the view expanded when no container element is available', () => {
        vi.stubGlobal('ResizeObserver', MockResizeObserver);
        const containerRef = ref<HTMLElement | null>(null);
        let isCompact!: ReturnType<typeof useCompactView>;
        const wrapper = mount(
            defineComponent({
                setup() {
                    isCompact = useCompactView(containerRef);
                    return () => h('div');
                },
            }),
        );

        expect(isCompact.value).toBe(false);
        expect(observers).toHaveLength(0);

        wrapper.unmount();
    });

    it('honors a custom breakpoint when provided', async () => {
        vi.stubGlobal('ResizeObserver', MockResizeObserver);
        const { wrapper, isCompact } = mountWithContainer(300);

        observers[0].fire(COMPACT_VIEW_MAX_WIDTH);
        await nextTick();
        expect(isCompact.value).toBe(false);

        observers[0].fire(300);
        await nextTick();
        expect(isCompact.value).toBe(true);

        wrapper.unmount();
    });

    it('observes the container once grants load after an initially empty mount and re-observes on reload', async () => {
        vi.stubGlobal('ResizeObserver', MockResizeObserver);
        const disconnectSpy = vi.spyOn(MockResizeObserver.prototype, 'disconnect');
        disconnectSpy.mockClear();
        const hasGrants = ref(false);
        let isCompact!: ReturnType<typeof useCompactView>;
        const wrapper = mount(
            defineComponent({
                setup() {
                    const viewEl = ref<HTMLElement | null>(null);
                    isCompact = useCompactView(viewEl);
                    return () => (hasGrants.value ? h('div', { ref: viewEl }) : null);
                },
            }),
        );

        expect(isCompact.value).toBe(false);
        expect(observers).toHaveLength(0);

        hasGrants.value = true;
        await nextTick();
        expect(observers).toHaveLength(1);

        observers[0].fire(COMPACT_VIEW_MAX_WIDTH);
        await nextTick();
        expect(isCompact.value).toBe(true);

        hasGrants.value = false;
        await nextTick();
        expect(isCompact.value).toBe(false);
        expect(disconnectSpy).toHaveBeenCalledTimes(1);
        expect(observers).toHaveLength(1);

        hasGrants.value = true;
        await nextTick();
        expect(observers).toHaveLength(2);

        observers[1].fire(COMPACT_VIEW_MAX_WIDTH + 1);
        await nextTick();
        expect(isCompact.value).toBe(false);

        wrapper.unmount();
    });

    it('leaves the view expanded when ResizeObserver is unavailable', () => {
        vi.stubGlobal('ResizeObserver', undefined);
        const { wrapper, isCompact } = mountWithContainer();

        expect(isCompact.value).toBe(false);
        expect(observers).toHaveLength(0);

        wrapper.unmount();
    });
});
