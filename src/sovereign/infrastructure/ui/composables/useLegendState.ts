import { ref } from 'vue';

const isLegendExpanded = ref(false);
const hasUserToggledLegend = ref(false);

export function useLegendState() {
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
