import { ENVIRONMENTAL_METRIC_COLORS } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { describe, expect, it } from 'vitest';
import {
    createWrapper,
    CULTIVATED_MEAT_TYPE_CASES,
    PLANT_BASED_MEAT_TYPE_CASES,
} from './EnvironmentalImpactPanel.spec.fixtures';

async function selectPillarTab(wrapper: ReturnType<typeof createWrapper>, tabLabel: string) {
    const tab = wrapper
        .find('[aria-label="Select production method for comparison"]')
        .findAll('.tab-selector-option')
        .find((button) => button.text() === tabLabel);
    await tab?.trigger('click');
}

async function selectMeatTab(wrapper: ReturnType<typeof createWrapper>, tabLabel: string) {
    const tab = wrapper
        .find('[aria-label="Select meat type for comparison"]')
        .findAll('.tab-selector-option')
        .find((button) => button.text() === tabLabel);
    await tab?.trigger('click');
}

function ringValue(wrapper: ReturnType<typeof createWrapper>, variant: string) {
    const labels: Record<string, string> = {
        ghg: 'GHG emissions',
        land: 'Land use',
        water: 'Water use',
    };
    const slot = wrapper
        .findAll('.metric-ring-slot')
        .find((candidate) => candidate.find('.metric-ring-label').text() === labels[variant]);
    const value = slot?.find('.metric-ring-value');
    return value?.exists() ? value.text().replace(/−/g, '-') : null;
}

describe('EnvironmentalImpactPanel', () => {
    it('renders a pillar tab for each production method with Plant-based selected by default', () => {
        const wrapper = createWrapper();
        const tabs = wrapper
            .find('[role="tablist"][aria-label="Select production method for comparison"]')
            .findAll('.tab-selector-option');
        expect(tabs.map((tab) => tab.text())).toEqual(['Plant-based 🌱', 'Cultivated meat 🧫']);
        expect(tabs[0]?.classes()).toContain('tab-selector-option--active');
    });

    describe('plant-based pillar', () => {
        it('renders a tab for each meat type with Beef selected by default', () => {
            const wrapper = createWrapper();
            const tabs = wrapper
                .find('[role="tablist"][aria-label="Select meat type for comparison"]')
                .findAll('.tab-selector-option');
            expect(tabs.map((tab) => tab.text())).toEqual(['Beef', 'Pork', 'Chicken']);
            expect(tabs[0]?.classes()).toContain('tab-selector-option--active');
            expect(wrapper.find('.panel-title').text()).toBe(
                'Plant-based meat vs. conventional meat',
            );
        });

        it('renders no metrics when no figure matches the selected meat type', async () => {
            const wrapper = createWrapper();
            const vm = wrapper.vm as unknown as { selectedMeatType: string };
            vm.selectedMeatType = 'unknown';
            await wrapper.vm.$nextTick();

            expect(wrapper.find('.metric-rings').text()).toBe('');
        });

        it.each(PLANT_BASED_MEAT_TYPE_CASES)(
            'shows $tabLabel figures when its tab is selected',
            async ({ tabLabel, ghg, land, water }) => {
                const wrapper = createWrapper();
                await selectMeatTab(wrapper, tabLabel);

                expect(ringValue(wrapper, 'ghg')).toBe(ghg);
                expect(ringValue(wrapper, 'land')).toBe(land);
                expect(ringValue(wrapper, 'water')).toBe(water);
            },
        );

        it('applies the GHG, Land, and Water metric colors to their rings', () => {
            const wrapper = createWrapper();

            const expectGradientColor = (variant: string, color: string) => {
                const labels: Record<string, string> = {
                    ghg: 'GHG emissions',
                    land: 'Land use',
                    water: 'Water use',
                };
                const stops = wrapper
                    .findAll('.metric-ring-slot')
                    .find((slot) => slot.find('.metric-ring-label').text() === labels[variant])
                    ?.findAll('stop');
                expect(stops?.[0]?.attributes('style')).toContain(color);
                expect(stops?.[1]?.attributes('style')).toContain(color);
            };

            expectGradientColor('ghg', ENVIRONMENTAL_METRIC_COLORS.ghg);
            expectGradientColor('land', ENVIRONMENTAL_METRIC_COLORS.land);
            expectGradientColor('water', ENVIRONMENTAL_METRIC_COLORS.water);

            const gradientIds = wrapper
                .findAll('linearGradient')
                .map((gradient) => gradient.attributes('id'));
            expect(new Set(gradientIds).size).toBe(3);
        });

        it('cites the GFI source', () => {
            const wrapper = createWrapper();
            expect(wrapper.find('.figure-source').text()).toBe(
                'Savings compared to conventional meat production; not tied to specific grants. Source: GFI.',
            );
        });
    });

    describe('cultivated pillar', () => {
        it('shows the cultivated GHG reduction for the default Beef tab', async () => {
            const wrapper = createWrapper();
            await selectPillarTab(wrapper, 'Cultivated meat 🧫');

            expect(wrapper.find('.panel-title').text()).toBe(
                'Cultivated meat vs. conventional meat',
            );
            expect(ringValue(wrapper, 'ghg')).toBe('-98%');
        });

        it('cites the CE Delft LCA source for the cultivated figures', async () => {
            const wrapper = createWrapper();
            await selectPillarTab(wrapper, 'Cultivated meat 🧫');

            expect(wrapper.find('.figure-source').text()).toBe(
                'Savings compared to conventional meat production; not tied to specific grants. Source: CE Delft.',
            );
        });

        it.each(CULTIVATED_MEAT_TYPE_CASES)(
            'shows $tabLabel figures when its tab is selected',
            async ({ tabLabel, ghg, land, water }) => {
                const wrapper = createWrapper();
                await selectPillarTab(wrapper, 'Cultivated meat 🧫');
                await selectMeatTab(wrapper, tabLabel);

                expect(ringValue(wrapper, 'ghg')).toBe(ghg);
                expect(ringValue(wrapper, 'land')).toBe(land);
                expect(ringValue(wrapper, 'water')).toBe(water);
            },
        );
    });

    it('switches back to plant-based figures when the plant-based tab is reselected', async () => {
        const wrapper = createWrapper();
        await selectPillarTab(wrapper, 'Cultivated meat 🧫');
        await selectPillarTab(wrapper, 'Plant-based 🌱');

        expect(wrapper.find('.panel-title').text()).toBe('Plant-based meat vs. conventional meat');
    });
});
