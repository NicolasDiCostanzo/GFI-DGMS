import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { type ThemeMode } from '../utils/fundingProgressLegend';
import ThemeToggle from './ThemeToggle.vue';

describe('ThemeToggle', () => {
    it('renders button with correct attributes and initial closed state', () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });
        const button = wrapper.find('button');
        expect(button.exists()).toBe(true);
        expect(button.element.tagName).toBe('BUTTON');
        expect(button.attributes('class')).toBe('theme-toggle-button');
        expect(button.attributes('aria-haspopup')).toBe('listbox');
        expect(button.attributes('aria-expanded')).toBe('false');
        expect(button.text()).toBe('Dark');
        expect(wrapper.find('.theme-toggle-dropdown').exists()).toBe(false);
    });

    it('renders fallback label when modelValue does not match any option', () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'invalid' as ThemeMode },
        });
        const button = wrapper.find('button');
        expect(button.text()).toBe('Dark');
    });

    it('does not render dropdown when closed with colorblind theme', () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'colorblind-dark' },
        });

        expect(wrapper.find('.theme-toggle-dropdown').exists()).toBe(false);
    });

    it('sets aria-expanded to true and shows dropdown on mouseenter', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        await wrapper.trigger('mouseenter');
        const button = wrapper.find('button');
        expect(button.attributes('aria-expanded')).toBe('true');
        expect(wrapper.find('.theme-toggle-dropdown').exists()).toBe(true);
    });

    it('resets aria-expanded to false and hides dropdown on mouseleave', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        await wrapper.trigger('mouseenter');
        expect(wrapper.find('.theme-toggle-dropdown').exists()).toBe(true);

        await wrapper.trigger('mouseleave');
        const button = wrapper.find('button');
        expect(button.attributes('aria-expanded')).toBe('false');
        expect(wrapper.find('.theme-toggle-dropdown').exists()).toBe(false);
    });

    it('emits update:modelValue when selecting a new theme', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        await wrapper.trigger('mouseenter');
        const options = wrapper.findAll('.theme-toggle-option');
        await options[0].trigger('click');

        expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
        expect(wrapper.emitted('update:modelValue')![0]).toEqual(['light']);
    });

    it('emits event when option is selected from dropdown', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        await wrapper.trigger('mouseenter');
        const options = wrapper.findAll('.theme-toggle-option');
        await options[2].trigger('click');

        expect(wrapper.emitted('update:modelValue')).toHaveLength(1);
        expect(wrapper.emitted('update:modelValue')![0]).toEqual(['colorblind-light']);
    });

    it('marks the selected option with is-selected class', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'colorblind-light' },
        });

        await wrapper.trigger('mouseenter');
        const options = wrapper.findAll('.theme-toggle-option');
        expect(options[2].classes()).toContain('is-selected');
    });

    it('applies correct swatch color for each theme option', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'light' },
        });

        await wrapper.trigger('mouseenter');
        const options = wrapper.findAll('.theme-toggle-option');
        const swatches = options.map((opt) => opt.find('.theme-toggle-swatch').attributes('style'));

        expect(swatches[0]).toContain('background-color: #e8f4f8');
        expect(swatches[1]).toContain('background-color: #1a2634');
        expect(swatches[2]).toContain('background-color: #0072B2');
        expect(swatches[3]).toContain('background-color: #0072B2');
    });

    it('renders all four theme options in the dropdown', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        await wrapper.trigger('mouseenter');
        const options = wrapper.findAll('.theme-toggle-option');
        expect(options.length).toBe(4);
    });

    it('applies light theme swatch color for light option', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'light' },
        });

        await wrapper.trigger('mouseenter');
        const options = wrapper.findAll('.theme-toggle-option');
        const swatches = options.map((opt) => opt.find('.theme-toggle-swatch').attributes('style'));

        expect(swatches[0]).toContain('background-color: #e8f4f8');
        expect(swatches[1]).toContain('background-color: #1a2634');
    });
});
