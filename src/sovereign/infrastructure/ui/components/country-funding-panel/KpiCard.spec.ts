import { describe, expect, it } from 'vitest';
import { createWrapper, GHG_FIGURES, KPI_CASES } from './KpiCard.spec.fixtures';

describe('KpiCard', () => {
    it('renders the title', () => {
        const wrapper = createWrapper({ title: 'GHG Reduction', figures: GHG_FIGURES });
        expect(wrapper.find('.kpi-card-title').text()).toBe('GHG Reduction');
    });

    it.each(KPI_CASES)(
        'renders a value for each figure in $title',
        ({ title, figures, count, expected, omitted }) => {
            const wrapper = createWrapper({ title, figures });
            const values = wrapper.findAll('.kpi-value');
            expect(values).toHaveLength(count);

            if (expected.length > 0 || omitted !== null) {
                const text = wrapper
                    .find('.kpi-card-values')
                    .text()
                    .replace(/\u2212/g, '-');
                for (const value of expected) {
                    expect(text).toContain(value);
                }
                if (omitted !== null) {
                    expect(text).not.toContain(omitted);
                }
            }
        },
    );

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
