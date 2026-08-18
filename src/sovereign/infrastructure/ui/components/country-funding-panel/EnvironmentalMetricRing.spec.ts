import { describe, expect, it } from 'vitest';
import { ENVIRONMENTAL_METRIC_COLORS } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { createWrapper, RING_CASES } from './EnvironmentalMetricRing.spec.fixtures';

describe('EnvironmentalMetricRing', () => {
    it('renders nothing when value is null', () => {
        const wrapper = createWrapper({
            value: null,
            label: 'Land',
            color: ENVIRONMENTAL_METRIC_COLORS.land,
        });
        expect(wrapper.find('.metric-ring').exists()).toBe(false);
    });

    it.each(RING_CASES)(
        'renders the value, label, and ring fill for $name',
        ({ value, label, color }) => {
            const wrapper = createWrapper({ value, label, color });

            const text = wrapper.find('.metric-ring-value').text().replace(/−/g, '-');
            expect(text).toBe(`-${value}%`);
            expect(wrapper.find('.metric-ring-label').text()).toBe(label);

            const fill = wrapper.find('.metric-ring-fill');
            expect(fill.attributes('stroke-dasharray')).toBe(`${value!} ${100 - value!}`);
            expect(fill.attributes('style')).toContain(color);
        },
    );

    it('renders the icon when provided', () => {
        const wrapper = createWrapper({
            value: 96,
            label: 'Land',
            color: ENVIRONMENTAL_METRIC_COLORS.land,
            icon: '🌱',
        });
        expect(wrapper.find('.metric-ring-icon').text()).toBe('🌱');
    });

    it('omits the icon when not provided', () => {
        const wrapper = createWrapper({
            value: 90,
            label: 'GHG Reduction',
            color: ENVIRONMENTAL_METRIC_COLORS.ghg,
        });
        expect(wrapper.find('.metric-ring-icon').exists()).toBe(false);
    });
});
