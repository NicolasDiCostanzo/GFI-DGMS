import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createWrapper, GERMANY, RESULTS, SLIDER_MAX } from './ContextualSidebar.spec.fixture';

let rafCallbacks = new Map<number, FrameRequestCallback>();

beforeEach(() => {
    rafCallbacks = new Map();
    let nextRafId = 1;
    vi.stubGlobal(
        'requestAnimationFrame',
        vi.fn((cb: FrameRequestCallback) => {
            const id = nextRafId++;
            rafCallbacks.set(id, cb);
            return id;
        }),
    );
    vi.stubGlobal(
        'cancelAnimationFrame',
        vi.fn((id: number) => {
            rafCallbacks.delete(id);
        }),
    );
});

function flushRaf(timestamp: number): void {
    const callbacks = [...rafCallbacks.values()];
    rafCallbacks.clear();
    for (const cb of callbacks) {
        cb(timestamp);
    }
}

describe('ContextualSidebar', () => {
    describe('empty state', () => {
        it('shows empty state message when no country is selected', () => {
            const wrapper = createWrapper();
            expect(wrapper.text()).toContain('Select a country on the map to begin');
        });

        it('does not render the slider when no country is selected', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('input[type="range"]').exists()).toBe(false);
        });

        it('does not render the country header when no country is selected', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('.country-header').exists()).toBe(false);
        });
    });

    describe('loading state', () => {
        it('shows skeleton placeholders when loading', () => {
            const wrapper = createWrapper({ country: GERMANY, isLoading: true });
            expect(wrapper.findAll('.skeleton').length).toBeGreaterThan(0);
        });

        it('does not show the slider when loading', () => {
            const wrapper = createWrapper({ country: GERMANY, isLoading: true });
            expect(wrapper.find('input[type="range"]').exists()).toBe(false);
        });

        it('includes an accessible status message that country data is loading', () => {
            const wrapper = createWrapper({ country: GERMANY, isLoading: true });
            const srMessage = wrapper.find('.sr-only');
            expect(srMessage.exists()).toBe(true);
            expect(srMessage.attributes('aria-live')).toBe('polite');
            expect(srMessage.text()).toBe('Loading country data');
        });

        it('marks skeleton elements as decorative with aria-hidden', () => {
            const wrapper = createWrapper({ country: GERMANY, isLoading: true });
            const skeletons = wrapper.findAll('.skeleton');
            expect(skeletons.length).toBeGreaterThan(0);
            for (const skeleton of skeletons) {
                expect(skeleton.attributes('aria-hidden')).toBe('true');
            }
        });
    });

    describe('error state', () => {
        it('shows error message with retry button', () => {
            const wrapper = createWrapper({ country: GERMANY, error: 'Something went wrong' });
            expect(wrapper.text()).toContain('Something went wrong');
            expect(wrapper.find('.retry-button').exists()).toBe(true);
        });

        it('emits retry event when retry button is clicked', async () => {
            const wrapper = createWrapper({ country: GERMANY, error: 'Something went wrong' });
            await wrapper.find('.retry-button').trigger('click');
            expect(wrapper.emitted('retry')).toHaveLength(1);
        });
    });

    describe('country header', () => {
        it('displays the country flag emoji', () => {
            const wrapper = createWrapper({ country: GERMANY });
            expect(wrapper.text()).toContain('🇩🇪');
        });

        it('displays the country name', () => {
            const wrapper = createWrapper({ country: GERMANY });
            expect(wrapper.text()).toContain('Germany');
        });

        const INVESTMENT_FORMATS: ReadonlyArray<[number, string]> = [
            [500, '$500M'],
            [1500, '$1.5B'],
        ];

        it.each(INVESTMENT_FORMATS)(
            'displays current investment as %s when sliderValue is %s',
            (sliderValue, expected) => {
                const wrapper = createWrapper({ country: GERMANY, sliderValue });
                expect(wrapper.text()).toContain(expected);
            },
        );
    });

    describe('currency slider', () => {
        it('renders a range input', () => {
            const wrapper = createWrapper({ country: GERMANY });
            expect(wrapper.find('input[type="range"]').exists()).toBe(true);
        });

        const ARIA_ATTRS: ReadonlyArray<[string, string]> = [
            ['aria-label', 'Investment amount in USD'],
            ['aria-valuemin', '0'],
            ['aria-valuemax', String(SLIDER_MAX)],
        ];

        it.each(ARIA_ATTRS)('sets %s attribute', (attr, expected) => {
            const wrapper = createWrapper({ country: GERMANY });
            expect(wrapper.find('input[type="range"]').attributes(attr)).toBe(expected);
        });

        it('sets aria-valuenow to the current slider value', () => {
            const wrapper = createWrapper({ country: GERMANY, sliderValue: 750 });
            expect(wrapper.find('input[type="range"]').attributes('aria-valuenow')).toBe('750');
        });

        it('emits update:sliderValue when the slider changes', async () => {
            const wrapper = createWrapper({ country: GERMANY, sliderValue: 500 });
            await wrapper.find('input[type="range"]').setValue(750);
            expect(wrapper.emitted('update:sliderValue')).toHaveLength(1);
            expect(wrapper.emitted('update:sliderValue')![0]).toEqual([750]);
        });

        it('displays the current value above the thumb', () => {
            const wrapper = createWrapper({ country: GERMANY, sliderValue: 750 });
            expect(wrapper.text()).toContain('$750M');
        });

        const TRACK_LABELS = ['$0', 'Baseline ($500M)', 'Target ($1B)', '200% ($2B)'];

        it.each(TRACK_LABELS)('renders track label "%s"', (label) => {
            const wrapper = createWrapper({ country: GERMANY });
            const labels = wrapper.findAll('.slider-label');
            expect(labels.map((l) => l.text())).toContain(label);
        });
    });

    describe('progress ring', () => {
        it('renders an SVG circle', () => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            expect(wrapper.find('svg circle').exists()).toBe(true);
        });

        it('displays funding progress percentage as center text', () => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            expect(wrapper.text()).toContain('75%');
        });

        it('displays "of Fair-Share Target" text', () => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            expect(wrapper.text()).toContain('of Fair-Share Target');
        });

        const CIRCLE_ATTRS: ReadonlyArray<[string, string]> = [['stroke', RESULTS.colorHex]];

        it.each(CIRCLE_ATTRS)(
            'progress circle has %s matching results colorHex',
            (attr, expected) => {
                const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
                const circles = wrapper.findAll('svg circle');
                const progressCircle = circles[circles.length - 1];
                expect(progressCircle.attributes(attr)).toBe(expected);
            },
        );

        it('progress circle has stroke-dasharray and stroke-dashoffset attributes', () => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            const circles = wrapper.findAll('svg circle');
            const progressCircle = circles[circles.length - 1];
            expect(progressCircle.attributes('stroke-dasharray')).toBeTruthy();
            expect(progressCircle.attributes('stroke-dashoffset')).toBeTruthy();
        });
    });

    describe('economic indicator', () => {
        it('displays the animated jobs count once the animation frame resolves', async () => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            flushRaf(1000);
            await nextTick();
            expect(wrapper.text()).toContain('2,500');
        });

        const ECONOMIC_TEXTS = ['Additional High-Tech Jobs', 'Based on GFI economic projections'];

        it.each(ECONOMIC_TEXTS)('displays "%s"', (text) => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            expect(wrapper.text()).toContain(text);
        });
    });

    describe('climate indicator', () => {
        const CLIMATE_TEXTS = [
            '1,250',
            'Metric Tonnes CO₂ Saved Annually',
            'cars off the road',
            'Based on CE Delft LCA data',
        ];

        it.each(CLIMATE_TEXTS)('displays "%s"', (text) => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            expect(wrapper.text()).toContain(text);
        });

        it('renders a horizontal bar element', () => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            expect(wrapper.find('.co2-bar').exists()).toBe(true);
        });
    });

    describe('accessibility', () => {
        it('slider has role="slider"', () => {
            const wrapper = createWrapper({ country: GERMANY });
            expect(wrapper.find('input[type="range"]').attributes('role')).toBe('slider');
        });

        it('progress ring has role="img" and aria-label', () => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            const svg = wrapper.find('svg');
            expect(svg.attributes('role')).toBe('img');
            expect(svg.attributes('aria-label')).toContain('funding progress');
        });
    });
});
