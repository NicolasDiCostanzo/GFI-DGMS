import { describe, expect, it } from 'vitest';
import {
    createWrapper,
    CULTIVATED_DOMINANT_GRANTS,
    PLANT_BASED_DOMINANT_GRANTS,
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

        it('lists GHG reductions per meat type', () => {
            const wrapper = createWrapper(PLANT_BASED_DOMINANT_GRANTS);
            const ghgCard = wrapper.find('.kpi-card--ghg');
            const ghgText = ghgCard.text().replace(/\u2212/g, '-');
            expect(ghgText).toContain('-90% (Beef)');
            expect(ghgText).toContain('-71% (Pork)');
            expect(ghgText).toContain('-36% (Chicken)');
        });

        it('lists land savings per meat type', () => {
            const wrapper = createWrapper(PLANT_BASED_DOMINANT_GRANTS);
            const landCard = wrapper.find('.kpi-card--land');
            const landText = landCard.text().replace(/\u2212/g, '-');
            expect(landText).toContain('-96% (Beef)');
            expect(landText).toContain('-41% (Pork)');
            expect(landText).not.toContain('Chicken');
        });

        it('lists water savings per meat type', () => {
            const wrapper = createWrapper(PLANT_BASED_DOMINANT_GRANTS);
            const waterCard = wrapper.find('.kpi-card--water');
            const waterText = waterCard.text().replace(/\u2212/g, '-');
            expect(waterText).toContain('-87% (Beef)');
            expect(waterText).toContain('-81% (Pork)');
            expect(waterText).toContain('-72% (Chicken)');
        });
    });

    describe('with a cultivated-dominant mix', () => {
        it('lists cultivated GHG reductions per meat type', () => {
            const wrapper = createWrapper(CULTIVATED_DOMINANT_GRANTS);
            const ghgCard = wrapper.find('.kpi-card--ghg');
            const ghgText = ghgCard.text().replace(/\u2212/g, '-');
            expect(ghgText).toContain('-98% (Beef)');
            expect(ghgText).toContain('-80% (Pork)');
            expect(ghgText).toContain('-75% (Chicken)');
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
