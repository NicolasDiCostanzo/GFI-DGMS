import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { defineComponent, nextTick } from 'vue';
import { useMediaQuery } from './useMediaQuery';

function createMockMediaQueryList(matches: boolean) {
    const listeners: Array<(event: Event) => void> = [];
    const mql = {
        matches,
        addEventListener: vi.fn((_type: string, listener: (event: Event) => void) => {
            listeners.push(listener);
        }),
        removeEventListener: vi.fn(),
    };
    return { mql, listeners };
}

function stubMatchMedia(mql: unknown) {
    Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockReturnValue(mql),
        configurable: true,
        writable: true,
    });
}

const TestComponent = defineComponent({
    props: {
        query: { type: String, required: true },
    },
    setup(props) {
        const matches = useMediaQuery(props.query);
        return { matches };
    },
    template: '<div>{{ matches }}</div>',
});

describe('useMediaQuery', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('reflects the initial match state on mount', async () => {
        const { mql } = createMockMediaQueryList(true);
        stubMatchMedia(mql);

        const wrapper = mount(TestComponent, { props: { query: '(max-width: 768px)' } });
        await nextTick();

        expect(wrapper.text()).toBe('true');
    });

    it('reflects a non-matching query as false on mount', async () => {
        const { mql } = createMockMediaQueryList(false);
        stubMatchMedia(mql);

        const wrapper = mount(TestComponent, { props: { query: '(max-width: 768px)' } });
        await nextTick();

        expect(wrapper.text()).toBe('false');
    });

    it('updates reactively when the media query changes', async () => {
        const { mql, listeners } = createMockMediaQueryList(false);
        stubMatchMedia(mql);

        const wrapper = mount(TestComponent, { props: { query: '(max-width: 768px)' } });
        await nextTick();
        expect(wrapper.text()).toBe('false');

        mql.matches = true;
        for (const listener of listeners) {
            listener(new Event('change'));
        }
        await nextTick();

        expect(wrapper.text()).toBe('true');
    });

    it('removes the change listener on unmount', () => {
        const { mql } = createMockMediaQueryList(true);
        stubMatchMedia(mql);

        const wrapper = mount(TestComponent, { props: { query: '(max-width: 768px)' } });
        wrapper.unmount();

        expect(mql.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });
});
