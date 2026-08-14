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
        it('lists all three meat types with their GHG figures', () => {
            const wrapper = createWrapper(PLANT_BASED_DOMINANT_GRANTS);
            const text = wrapper.text();

            expect(text).toContain('up to -90% GHG');
            expect(text).toContain('up to -71% GHG');
            expect(text).toContain('up to -36% GHG');
        });

        it('omits land/water figures that are not published for a meat type', () => {
            const wrapper = createWrapper(PLANT_BASED_DOMINANT_GRANTS);
            const chickenItem = wrapper
                .findAll('.figure-item')
                .find((item) => item.text().includes('chicken'));

            expect(chickenItem?.text()).not.toContain('land');
        });
    });

    describe('with a cultivated-dominant mix', () => {
        it('lists all three meat types with their GHG figures', () => {
            const wrapper = createWrapper(CULTIVATED_DOMINANT_GRANTS);
            const text = wrapper.text();

            expect(text).toContain('up to -98% GHG');
            expect(text).toContain('up to -80% GHG');
            expect(text).toContain('up to -75% GHG');
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
