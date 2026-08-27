import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import TabSelector from './TabSelector.vue';

const OPTIONS = ['a', 'b'] as const;
const LABELS: Readonly<Record<(typeof OPTIONS)[number], string>> = {
    a: 'Alpha',
    b: 'Beta',
};

function createWrapper(overrides: Record<string, unknown> = {}) {
    return mount(TabSelector, {
        props: {
            options: OPTIONS,
            labels: LABELS,
            modelValue: 'a',
            accessibilityLabel: 'Choose an option',
            ...overrides,
        },
    });
}

describe('TabSelector', () => {
    it('renders a tab per option showing its label', () => {
        const wrapper = createWrapper();
        const tabs = wrapper.findAll('.tab-selector-option');
        expect(tabs.map((tab) => tab.text())).toEqual(['Alpha', 'Beta']);
    });

    it('exposes the tablist role and aria label on the container', () => {
        const wrapper = createWrapper();
        const container = wrapper.find('.tab-selector');
        expect(container.attributes('role')).toBe('tablist');
        expect(container.attributes('aria-label')).toBe('Choose an option');
    });

    it('marks each tab with the tab role and reflects the selected option', () => {
        const wrapper = createWrapper();
        const [first, second] = wrapper.findAll('.tab-selector-option');
        expect(first?.attributes('role')).toBe('tab');
        expect(first?.attributes('aria-selected')).toBe('true');
        expect(second?.attributes('aria-selected')).toBe('false');
        expect(first?.classes()).toContain('tab-selector-option--active');
        expect(second?.classes()).not.toContain('tab-selector-option--active');
    });

    it('emits update:modelValue with the clicked option', () => {
        const wrapper = createWrapper();
        const second = wrapper.findAll('.tab-selector-option')[1];
        second?.trigger('click');
        expect(wrapper.emitted('update:modelValue')).toEqual([['b']]);
    });

    it('defaults the fontWeight style to 700', () => {
        const wrapper = createWrapper();
        expect(wrapper.find('.tab-selector-option').attributes('style')).toContain(
            'font-weight: 700',
        );
    });

    it('applies the provided fontWeight as an inline style', () => {
        const wrapper = createWrapper({ fontWeight: 600 });
        expect(wrapper.find('.tab-selector-option').attributes('style')).toContain(
            'font-weight: 600',
        );
    });
});
