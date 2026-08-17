import { describe, expect, it } from 'vitest';
import {
    createWrapper,
    CULTIVATED_DOMINANT_GRANTS,
    PLANT_BASED_DOMINANT_GRANTS,
    PLANT_BASED_KPI_CASES,
    TIED_GRANTS,
} from './EnvironmentalImpactPanel.spec.fixtures';

describe('EnvironmentalImpactPanel', () => {
    describe('with no grants', () => {
        it('renders nothing', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('.environmental-impact-panel').exists()).toBe(false);
        });
    });

    describe('with a tied production mix', () => {
        it('renders nothing', () => {
            const wrapper = createWrapper(TIED_GRANTS);
            expect(wrapper.find('.environmental-impact-panel').exists()).toBe(false);
        });
    });

    describe('with a plant-based-dominant mix', () => {
        it('renders three KPI cards', () => {
            const wrapper = createWrapper(PLANT_BASED_DOMINANT_GRANTS);
            expect(wrapper.findAll('.kpi-card')).toHaveLength(3);
        });

        it.each(PLANT_BASED_KPI_CASES)(
            'lists savings per meat type for $selector',
            ({ selector, expected, omitted }) => {
                const wrapper = createWrapper(PLANT_BASED_DOMINANT_GRANTS);
                const text = wrapper
                    .find(selector)
                    .text()
                    .replace(/\u2212/g, '-');
                for (const value of expected) {
                    expect(text).toContain(value);
                }
                if (omitted !== null) {
                    expect(text).not.toContain(omitted);
                }
            },
        );
    });

    describe('with a cultivated-dominant mix', () => {
        it('lists cultivated GHG reductions per meat type', () => {
            const wrapper = createWrapper(CULTIVATED_DOMINANT_GRANTS);
            const ghgCard = wrapper.find('.kpi-card--ghg');
            const ghgText = ghgCard.text().replace(/\u2212/g, '-');
            expect(ghgText).toContain('-98% (beef)');
            expect(ghgText).toContain('-80% (pork)');
            expect(ghgText).toContain('-75% (chicken)');
        });

        it('cites the CE Delft LCA source for the cultivated figures', () => {
            const wrapper = createWrapper(CULTIVATED_DOMINANT_GRANTS);
            expect(wrapper.find('.figure-source').text()).toContain(
                'CE Delft, "LCA of Cultivated Meat"',
            );
        });
    });

    describe('sourcing', () => {
        it('cites the GFI plant-based source when plant-based is dominant', () => {
            const wrapper = createWrapper(PLANT_BASED_DOMINANT_GRANTS);
            expect(wrapper.find('.figure-source').text()).toContain(
                'Environmental benefits of alternative proteins',
            );
            expect(wrapper.find('.figure-source').text()).toContain('not specific to this');
        });
    });
});
