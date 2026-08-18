<template>
    <section v-if="figures.length" class="environmental-impact-panel">
        <h3 class="legend-title">Environmental potential of {{ pillarLabel }}</h3>

        <div class="kpi-cards">
            <KpiCard variant="ghg" title="GHG Reduction" :figures="ghgFigures" />
            <KpiCard variant="land" title="Land Saved" :figures="landFigures" />
            <KpiCard variant="water" title="Water Saved" :figures="waterFigures" />
        </div>

        <p class="figure-source">{{ sourceText }}</p>
    </section>
</template>

<script setup lang="ts">
import type { Grant } from '@/sovereign/domain/Grant';
import { computed } from 'vue';
import {
    CULTIVATED_LCA_FIGURES,
    PLANT_BASED_LCA_FIGURES,
} from '../../constants/EnvironmentalImpactData';
import { resolveDominantProductionPillar } from '../../utils/resolveDominantProductionPillar';
import KpiCard from './KpiCard.vue';

const props = withDefaults(
    defineProps<{
        grants?: readonly Grant[];
    }>(),
    {
        grants: () => [],
    },
);

const dominantPillar = computed(() => resolveDominantProductionPillar(props.grants));

const figures = computed(() => {
    if (dominantPillar.value === 'Plant-based') return PLANT_BASED_LCA_FIGURES;
    if (dominantPillar.value === 'Cultivated') return CULTIVATED_LCA_FIGURES;
    return [];
});

const pillarLabel = computed(() =>
    dominantPillar.value === 'Cultivated'
        ? 'cultivated meat (produced with renewable energy)'
        : 'plant-based meat',
);

const sourceText = computed(() =>
    dominantPillar.value === 'Cultivated'
        ? 'vs. conventional meat. General, illustrative technology figures — not specific to this country\'s funding or any single grant. Source: CE Delft, "LCA of Cultivated Meat".'
        : 'vs. conventional meat. General, illustrative technology figures — not specific to this country\'s funding or any single grant. Source: GFI, "Environmental benefits of alternative proteins".',
);

const ghgFigures = computed(() =>
    figures.value.map((figure) => ({
        label: figure.meatType,
        value: figure.ghgReductionPercent,
    })),
);

const landFigures = computed(() =>
    figures.value.map((figure) => ({
        label: figure.meatType,
        value: figure.landReductionPercent,
    })),
);

const waterFigures = computed(() =>
    figures.value.map((figure) => ({
        label: figure.meatType,
        value: figure.waterReductionPercent,
    })),
);
</script>

<style scoped>
.environmental-impact-panel {
    border-top: 1px solid var(--muted-border);
    padding-top: 12px;
    font-size: 13px;
}

.kpi-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-top: 12px;
}

.figure-source {
    font-size: 11px;
    font-style: italic;
    margin-top: 8px;
}
</style>
