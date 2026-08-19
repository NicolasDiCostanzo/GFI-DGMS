import { ENVIRONMENTAL_METRIC_COLORS } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { describe, expect, it } from 'vitest';
import {
    createWrapper,
    CULTIVATED_DOMINANT_GRANTS,
    PLANT_BASED_DOMINANT_GRANTS,
    PLANT_BASED_MEAT_TYPE_CASES,
    TIED_GRANTS,
} from './EnvironmentalImpactPanel.spec.fixtures';

async function selectTab(wrapper: ReturnType<typeof createWrapper>, tabLabel: string) {
    const tab = wrapper.findAll('.meat-type-tab').find((button) => button.text() === tabLabel);
    await tab?.trigger('click');
}

function ringValue(wrapper: ReturnType<typeof createWrapper>, variant: string) {
    const value = wrapper.find(`.metric-ring-slot--${variant} .metric-ring-value`);
    return value.exists() ? value.text().replace(/−/g, '-') : null;
}

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
        it('renders a tab for each meat type with Beef selected by default', () => {
            const wrapper = createWrapper(PLANT_BASED_DOMINANT_GRANTS);
            const tabs = wrapper.findAll('.meat-type-tab');
            expect(tabs.map((tab) => tab.text())).toEqual(['Beef', 'Pork', 'Chicken']);
            expect(tabs[0]?.classes()).toContain('meat-type-tab--active');
            expect(wrapper.find('.legend-title').text()).toBe(
                'Environmental potential of plant-based meat',
            );
        });

        it('renders no metrics when no figure matches the selected meat type', async () => {
            const wrapper = createWrapper(PLANT_BASED_DOMINANT_GRANTS);
            const vm = wrapper.vm as unknown as { selectedMeatType: string };
            vm.selectedMeatType = 'unknown';
            await wrapper.vm.$nextTick();

            expect(wrapper.find('.metric-rings').text()).toBe('');
        });

        it.each(PLANT_BASED_MEAT_TYPE_CASES)(
            'shows $tabLabel figures when its tab is selected',
            async ({ tabLabel, ghg, land, water }) => {
                const wrapper = createWrapper(PLANT_BASED_DOMINANT_GRANTS);
                await selectTab(wrapper, tabLabel);

                expect(ringValue(wrapper, 'ghg')).toBe(ghg);
                expect(ringValue(wrapper, 'land')).toBe(land);
                expect(ringValue(wrapper, 'water')).toBe(water);
            },
        );

        it('applies the GHG, Land, and Water metric colors to their rings', () => {
            const wrapper = createWrapper(PLANT_BASED_DOMINANT_GRANTS);

            const expectGradientColor = (variant: string, color: string) => {
                const stops = wrapper.findAll(`.metric-ring-slot--${variant} stop`);
                expect(stops[0]?.attributes('style')).toContain(color);
                expect(stops[1]?.attributes('style')).toContain(color);
            };

            expectGradientColor('ghg', ENVIRONMENTAL_METRIC_COLORS.ghg);
            expectGradientColor('land', ENVIRONMENTAL_METRIC_COLORS.land);
            expectGradientColor('water', ENVIRONMENTAL_METRIC_COLORS.water);

            const gradientIds = wrapper
                .findAll('linearGradient')
                .map((gradient) => gradient.attributes('id'));
            expect(new Set(gradientIds).size).toBe(3);
        });
    });

    describe('with a cultivated-dominant mix', () => {
        it('shows the cultivated GHG reduction for the default Beef tab', () => {
            const wrapper = createWrapper(CULTIVATED_DOMINANT_GRANTS);
            expect(ringValue(wrapper, 'ghg')).toBe('-98%');
        });

        it('cites the CE Delft LCA source for the cultivated figures', () => {
            const wrapper = createWrapper(CULTIVATED_DOMINANT_GRANTS);
            expect(wrapper.find('.figure-source').text()).toContain(
                'CE Delft, "LCA of Cultivated Meat"',
            );
        });

        it('omits metrics whose cultivated figure is unavailable', async () => {
            const wrapper = createWrapper(CULTIVATED_DOMINANT_GRANTS);
            await selectTab(wrapper, 'Pork');

            expect(ringValue(wrapper, 'ghg')).toBe('-80%');
            expect(ringValue(wrapper, 'land')).toBe('-70%');
            expect(ringValue(wrapper, 'water')).toBeNull();
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
