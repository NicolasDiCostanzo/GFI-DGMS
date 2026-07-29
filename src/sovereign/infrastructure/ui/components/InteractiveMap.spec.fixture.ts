import { Currency } from '@/shared/types/Currency';
import { MapColors } from '@/sovereign/domain/constants/MapColors';
import { Country, CountryId } from '@/sovereign/domain/Country';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';
import { TargetBudget } from '@/sovereign/domain/TargetBudget';

export const GERMANY = new Country(
    CountryId('276'),
    'Germany',
    500,
    new TargetBudget(1000, Currency.USD()),
    10,
    5,
);

export const FRANCE = new Country(
    CountryId('250'),
    'France',
    300,
    new TargetBudget(800, Currency.EUR()),
    8,
    4,
);

export const RESULTS_GERMANY: SimulationResults = {
    fundingProgress: 0.75,
    additionalJobs: 2500,
    additionalCO2Tonnes: 1250,
    isOverTarget: false,
    colorHex: MapColors.ORANGE,
};

export const RESULTS_FRANCE: SimulationResults = {
    fundingProgress: 0.9,
    additionalJobs: 1800,
    additionalCO2Tonnes: 950,
    isOverTarget: true,
    colorHex: MapColors.YELLOW_AMBER,
};

export const NO_RESULTS = new Map<CountryId, SimulationResults>();

export function createWrapperDefaults() {
    return {
        countries: [GERMANY],
        resultsByCountry: new Map<CountryId, SimulationResults>([
            ['276' as CountryId, RESULTS_GERMANY],
        ]),
        selectedCountryId: null as CountryId | null,
    };
}
