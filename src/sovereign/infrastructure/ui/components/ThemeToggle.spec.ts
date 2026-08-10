import { COLORBLIND_FUNDING_PROGRESS_COLORS } from '@/sovereign/domain/constants/MapColors';
import {
    DARK_THEME_COLORS,
    LIGHT_THEME_COLORS,
} from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { type ThemeMode } from '../utils/fundingProgressLegend';
import { ICON_CASES } from './ThemeToggle.spec.fixtures';
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

    it('opens the dropdown when the button is clicked', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        const button = wrapper.find('button');
        await button.trigger('click');

        expect(button.attributes('aria-expanded')).toBe('true');
        expect(wrapper.find('.theme-toggle-dropdown').exists()).toBe(true);
    });

    it('stays open when a real mouse click follows the pointer-enter that opened it', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        const button = wrapper.find('button');
        await wrapper.trigger('mouseenter');
        await button.trigger('click');

        expect(button.attributes('aria-expanded')).toBe('true');
        expect(wrapper.find('.theme-toggle-dropdown').exists()).toBe(true);
    });

    it('stays open on a second button click', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        const button = wrapper.find('button');
        await button.trigger('click');
        await button.trigger('click');

        expect(button.attributes('aria-expanded')).toBe('true');
        expect(wrapper.find('.theme-toggle-dropdown').exists()).toBe(true);
    });

    it('closes the dropdown after selecting an option', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        const button = wrapper.find('button');
        await button.trigger('click');
        const options = wrapper.findAll('.theme-toggle-option');
        await options[0].trigger('click');

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

    it.each([0, 1, 2, 3])('option %s icon in the dropdown contains an svg', async (index) => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        await wrapper.trigger('mouseenter');
        const options = wrapper.findAll('.theme-toggle-option');

        expect(options[index].find('.theme-toggle-option-icon').html()).toContain('svg');
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

    it.each(ICON_CASES)('%s', (_title, modelValue, expectedSubstrings) => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue },
        });

        const buttonIcon = wrapper.find('.theme-toggle-icon');
        for (const substring of expectedSubstrings) {
            expect(buttonIcon.html()).toContain(substring);
        }
    });

    it('renders all four theme options in the dropdown', async () => {
        const wrapper = mount(ThemeToggle, {
            props: { modelValue: 'dark' },
        });

        await wrapper.trigger('mouseenter');
        const options = wrapper.findAll('.theme-toggle-option');
        expect(options.length).toBe(4);
    });
});
