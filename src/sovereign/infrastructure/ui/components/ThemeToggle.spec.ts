import {
    COLORBLIND_FUNDING_PROGRESS_COLORS,
    DARK_THEME_COLORS,
    LIGHT_THEME_COLORS,
} from '@/sovereign/domain/constants/MapColors';
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
        expect(button.find('.theme-toggle-icon').exists()).toBe(true);
        expect(button.find('.theme-toggle-label').text()).toBe('Dark');
        expect(wrapper.find('.theme-toggle-dropdown').exists()).toBe(false);
    });

    it('renders fallback label when modelValue does not match any option', () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'invalid' as ThemeMode },
        });
        const button = wrapper.find('button');
        expect(button.find('.theme-toggle-label').text()).toBe('Dark');
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

    it('displays correct icon for each theme in the button', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'light' },
        });

        const buttonIcon = wrapper.find('.theme-toggle-icon');
        expect(buttonIcon.html()).toContain('svg');
        expect(buttonIcon.html()).toContain('circle');
    });

    it('displays correct icon for each theme option in dropdown', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        await wrapper.trigger('mouseenter');
        const options = wrapper.findAll('.theme-toggle-option');

        expect(options[0].find('.theme-toggle-option-icon').html()).toContain('svg');
        expect(options[1].find('.theme-toggle-option-icon').html()).toContain('svg');
        expect(options[2].find('.theme-toggle-option-icon').html()).toContain('svg');
        expect(options[3].find('.theme-toggle-option-icon').html()).toContain('svg');
    });

    it('applies correct swatch color for each theme option', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'light' },
        });

        await wrapper.trigger('mouseenter');
        const options = wrapper.findAll('.theme-toggle-option');
        const swatches = options.map((opt) => opt.find('.theme-toggle-swatch').attributes('style'));

        expect(swatches[0]).toContain(`background-color: ${LIGHT_THEME_COLORS.OCEAN}`);
        expect(swatches[1]).toContain(`background-color: ${DARK_THEME_COLORS.OCEAN}`);
        expect(swatches[2]).toContain(`background-color: ${COLORBLIND_FUNDING_PROGRESS_COLORS[0]}`);
        expect(swatches[3]).toContain(`background-color: ${COLORBLIND_FUNDING_PROGRESS_COLORS[0]}`);
    });

    it('renders sun icon for light theme', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'light' },
        });

        const buttonIcon = wrapper.find('.theme-toggle-icon');
        expect(buttonIcon.html()).toContain('circle');
        expect(buttonIcon.html()).toContain('line');
    });

    it('renders moon icon for dark theme', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        const buttonIcon = wrapper.find('.theme-toggle-icon');
        expect(buttonIcon.html()).toContain('path');
    });

    it('renders eye icon for colorblind-light theme', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'colorblind-light' },
        });

        const buttonIcon = wrapper.find('.theme-toggle-icon');
        expect(buttonIcon.html()).toContain('path');
        expect(buttonIcon.html()).toContain('circle');
    });

    it('renders eye-off icon for colorblind-dark theme', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'colorblind-dark' },
        });

        const buttonIcon = wrapper.find('.theme-toggle-icon');
        expect(buttonIcon.html()).toContain('path');
        expect(buttonIcon.html()).toContain('line');
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

        expect(swatches[0]).toContain(`background-color: ${LIGHT_THEME_COLORS.OCEAN}`);
        expect(swatches[1]).toContain(`background-color: ${DARK_THEME_COLORS.OCEAN}`);
    });
});
