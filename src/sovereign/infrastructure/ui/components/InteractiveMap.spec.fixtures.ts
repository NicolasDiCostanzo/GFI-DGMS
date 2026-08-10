import { MapColors } from '@/sovereign/domain/constants/MapColors';
import { CountryId } from '@/sovereign/domain/Country';
import { GERMANY } from '@/sovereign/domain/Country.spec.fixtures';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';

export const RESULTS_GERMANY: SimulationResults = {
    fundingProgress: 0.75,
    additionalJobs: 2500,
    additionalCO2Tonnes: 1250,
    colorHex: MapColors.ORANGE,
};

/**
 * Creates the default state used by the interactive map wrapper.
 *
 * @returns Wrapper state containing Germany, its simulation results, no selected country, and dark theme mode.
 */
export function createWrapperDefaults() {
    return {
        countries: [GERMANY],
        resultsByCountry: new Map<CountryId, SimulationResults>([
            ['276' as CountryId, RESULTS_GERMANY],
        ]),
        selectedCountryId: null as CountryId | null,
        themeMode: 'dark' as const,
    };
}
