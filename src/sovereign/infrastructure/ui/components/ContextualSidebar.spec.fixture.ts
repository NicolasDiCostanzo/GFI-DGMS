import { MapColors, ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { Country, CountryId } from '@/sovereign/domain/Country';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';
import { TargetBudget } from '@/sovereign/domain/TargetBudget';
import { mount } from '@vue/test-utils';
import ContextualSidebar from './ContextualSidebar.vue';

export const GERMANY = new Country(
    CountryId('276'),
    'Germany',
    500,
    new TargetBudget(1000),
    10,
    5,
    1000,
    5,
);

export const RESULTS: SimulationResults = {
    fundingProgress: 0.75,
    additionalJobs: 2500,
    additionalCO2Tonnes: 1250,
    isOverTarget: false,
    colorHex: MapColors.ORANGE,
};

export const SLIDER_MAX = GERMANY.targetBudget.amount * 2;
export interface WrapperOptions {
    country?: Country | null;
    results?: SimulationResults | null;
    sliderValue?: number;
    themeMode?: ThemeMode;
}

export function createWrapper(options: WrapperOptions = {}) {
    const props = {
        country: options.country ?? null,
        results: options.results ?? null,
        sliderValue: options.sliderValue ?? 0,
        themeMode: options.themeMode ?? 'dark',
    };

    return mount(ContextualSidebar, {
        props,
    });
}
