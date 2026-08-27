import { ref } from 'vue';

const isLegendExpanded = ref(false);
const hasUserToggledLegend = ref(false);
let lastCountryName: string | null = null;

export function useLegendState(countryName: string) {
    if (lastCountryName !== null && lastCountryName !== countryName) {
        resetLegendState();
    }
    lastCountryName = countryName;

    function toggleLegend(): void {
        hasUserToggledLegend.value = true;
        isLegendExpanded.value = !isLegendExpanded.value;
    }

    return { isLegendExpanded, hasUserToggledLegend, toggleLegend };
}

export function resetLegendState(): void {
    isLegendExpanded.value = false;
    hasUserToggledLegend.value = false;
}
