import { describe, expect, it } from 'vitest';
import { createWrapper, GHG_FIGURES, LAND_FIGURES, WATER_FIGURES } from './KpiCard.spec.fixtures';

describe('KpiCard', () => {
    it('renders the title', () => {
        const wrapper = createWrapper({ title: 'GHG Reduction', figures: GHG_FIGURES });
        expect(wrapper.find('.kpi-card-title').text()).toBe('GHG Reduction');
    });

    it('renders a value for each non-null figure', () => {
        const wrapper = createWrapper({ title: 'GHG Reduction', figures: GHG_FIGURES });
        const values = wrapper.findAll('.kpi-value');
        expect(values).toHaveLength(3);
        const text = wrapper
            .find('.kpi-card-values')
            .text()
            .replace(/\u2212/g, '-');
        expect(text).toContain('-90% (Beef)');
        expect(text).toContain('-71% (Pork)');
        expect(text).toContain('-36% (Chicken)');
    });

    it('skips figures with null values', () => {
        const wrapper = createWrapper({ title: 'Land Saved', figures: LAND_FIGURES });
        const values = wrapper.findAll('.kpi-value');
        expect(values).toHaveLength(2);
        const text = wrapper
            .find('.kpi-card-values')
            .text()
            .replace(/\u2212/g, '-');
        expect(text).toContain('-96% (Beef)');
        expect(text).toContain('-41% (Pork)');
        expect(text).not.toContain('Chicken');
    });

    it('renders all figures when none are null', () => {
        const wrapper = createWrapper({ title: 'Water Saved', figures: WATER_FIGURES });
        const values = wrapper.findAll('.kpi-value');
        expect(values).toHaveLength(3);
    });

    it('applies the variant modifier class when provided', () => {
        const wrapper = createWrapper({
            title: 'GHG Reduction',
            figures: GHG_FIGURES,
            variant: 'ghg',
        });
        expect(wrapper.find('.kpi-card--ghg').exists()).toBe(true);
    });

    it('does not apply a variant modifier class when not provided', () => {
        const wrapper = createWrapper({ title: 'GHG Reduction', figures: GHG_FIGURES });
        expect(wrapper.find('.kpi-card--ghg').exists()).toBe(false);
    });
});
