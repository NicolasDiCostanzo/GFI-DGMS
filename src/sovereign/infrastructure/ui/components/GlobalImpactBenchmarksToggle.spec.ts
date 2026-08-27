import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GlobalImpactBenchmarksToggle from './GlobalImpactBenchmarksToggle.vue';

describe('GlobalImpactBenchmarksToggle', () => {
    it('renders a button with the benchmarks label', () => {
        const wrapper = mount(GlobalImpactBenchmarksToggle, {
            props: { modelValue: false },
        });
        const button = wrapper.find('button');

        expect(button.exists()).toBe(true);
        expect(button.text()).toBe('ⓘ Global Impact Benchmarks');
    });

    it.each([
        [false, 'false'],
        [true, 'true'],
    ])('reflects modelValue %s in aria-expanded', (modelValue, expectedAriaExpanded) => {
        const wrapper = mount(GlobalImpactBenchmarksToggle, {
            props: { modelValue },
        });

        expect(wrapper.find('button').attributes('aria-expanded')).toBe(expectedAriaExpanded);
    });

    it.each([
        [false, true],
        [true, false],
    ])('emits update:modelValue with %s negated to %s on click', async (modelValue, expected) => {
        const wrapper = mount(GlobalImpactBenchmarksToggle, {
            props: { modelValue },
        });

        await wrapper.find('button').trigger('click');

        expect(wrapper.emitted('update:modelValue')).toEqual([[expected]]);
    });
});
