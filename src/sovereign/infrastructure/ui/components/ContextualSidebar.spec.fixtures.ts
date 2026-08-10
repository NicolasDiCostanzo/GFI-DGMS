import { MAX_FUNDING_PROGRESS_RATIO } from '@/sovereign/domain/constants/FundingConstants';
import { MapColors, ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { Country } from '@/sovereign/domain/Country';
import { GERMANY } from '@/sovereign/domain/Country.spec.fixtures';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';
import { mount } from '@vue/test-utils';
import ContextualSidebar from './ContextualSidebar.vue';

export { GERMANY };

export const RESULTS: SimulationResults = {
    fundingProgress: 0.75,
    additionalJobs: 2500,
    additionalCO2Tonnes: 1250,
    colorHex: MapColors.ORANGE,
};

export const SLIDER_MAX = GERMANY.targetBudget.amount * MAX_FUNDING_PROGRESS_RATIO;
export interface WrapperOptions {
    country?: Country | null;
    results?: SimulationResults | null;
    sliderValue?: number;
    themeMode?: ThemeMode;
}

/**
 * Creates a mounted `ContextualSidebar` wrapper with configurable fixture props.
 *
 * @param options - Optional prop overrides for the mounted component
 * @returns The mounted `ContextualSidebar` wrapper
 */
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
