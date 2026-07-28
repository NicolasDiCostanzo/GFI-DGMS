import { toPercentage } from '@/shared/utils/toPercentage';
import type { FeatureCollection, Geometry } from 'geojson';
import { computed, type Ref } from 'vue';
import { MapColors } from '../../../domain/constants/MapColors';
import type { Country, CountryId } from '../../../domain/Country';
import type { SimulationResults } from '../../../domain/SimulationResults';

interface NamedFeatureProperties {
    name: string;
}

export function useCountryDisplay(
    countries: Ref<Country[]>,
    resultsByCountry: Ref<Map<CountryId, SimulationResults>>,
    geoJsonCountries: Ref<FeatureCollection<Geometry, NamedFeatureProperties>>,
) {
    const countryNameMap = computed(() => {
        const map = new Map<string, string>();
        for (const country of countries.value) {
            map.set(country.id, country.name);
        }
        for (const feature of geoJsonCountries.value.features) {
            const id = String(feature.id);
            if (!map.has(id)) {
                map.set(id, feature.properties.name);
            }
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
