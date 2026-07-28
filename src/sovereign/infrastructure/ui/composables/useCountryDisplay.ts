import { toPercentage } from '@/shared/utils/toPercentage';
import { computed, type Ref } from 'vue';
import { MapColors } from '../../../domain/constants/MapColors';
import type { Country, CountryId } from '../../../domain/Country';
import type { SimulationResults } from '../../../domain/SimulationResults';

export function useCountryDisplay(
    countries: Ref<Country[]>,
    resultsByCountry: Ref<Map<CountryId, SimulationResults>>,
) {
    const countryNameMap = computed(() => {
        const map = new Map<string, string>();
        for (const country of countries.value) {
            map.set(country.id, country.name);
        }
        return map;
    });

    function getCountryFill(isoNumeric: string): string {
        const results = resultsByCountry.value.get(isoNumeric as CountryId);
        return results ? results.colorHex : MapColors.INACTIVE;
    }

    function getCountryAriaLabel(isoNumeric: string): string {
        const name = countryNameMap.value.get(isoNumeric) ?? 'Unknown';
        const results = resultsByCountry.value.get(isoNumeric as CountryId);
        if (results) {
            return `${name} — ${toPercentage(results.fundingProgress)}% funded`;
        }
        return `${name} — no data`;
    }

    function getTooltipText(isoNumeric: string): string {
        const name = countryNameMap.value.get(isoNumeric) ?? 'Unknown';
        const results = resultsByCountry.value.get(isoNumeric as CountryId);
        if (results) {
            return `${name} — ${toPercentage(results.fundingProgress)}%`;
        }
        return `${name} — no data`;
    }

    return {
        getCountryFill,
        getCountryAriaLabel,
        getTooltipText,
    };
}
