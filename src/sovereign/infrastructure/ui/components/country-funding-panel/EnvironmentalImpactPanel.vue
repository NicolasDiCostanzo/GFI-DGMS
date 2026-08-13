<script setup lang="ts">
import type { Grant } from '@/sovereign/domain/Grant';
import { computed } from 'vue';
import {
    CULTIVATED_LCA_FIGURES,
    PLANT_BASED_LCA_FIGURES,
} from '../../constants/EnvironmentalImpactData';
import { resolveDominantProductionPillar } from '../../utils/resolveDominantProductionPillar';

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
    return null;
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
</script>

<template>
    <section v-if="figures" class="environmental-impact-panel">
        <h3 class="panel-title">Environmental potential of {{ pillarLabel }}</h3>
        <ul class="figure-list">
            <li v-for="figure in figures" :key="figure.meatType" class="figure-item">
                <span class="meat-type">{{ figure.meatType }}</span>
                <span class="figure-value">up to -{{ figure.ghgReductionPercent }}% GHG</span>
                <span v-if="figure.landReductionPercent !== null" class="figure-value">
                    up to -{{ figure.landReductionPercent }}% land</span
                >
                <span v-if="figure.waterReductionPercent !== null" class="figure-value">
                    up to -{{ figure.waterReductionPercent }}% water</span
                >
            </li>
        </ul>
        <p class="figure-source">{{ sourceText }}</p>
    </section>
</template>

<style scoped>
.environmental-impact-panel {
    border-top: 1px solid var(--muted-border);
    padding-top: 12px;
    font-size: 13px;
}

.panel-title {
    font-size: 14px;
    font-weight: 600;
    margin: 0 0 8px;
}

.figure-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.figure-item {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
}

.meat-type {
    font-weight: 600;
    text-transform: capitalize;
    min-width: 60px;
}

.figure-source {
    font-size: 11px;
    font-style: italic;
    margin: 8px 0 0;
}
</style>
