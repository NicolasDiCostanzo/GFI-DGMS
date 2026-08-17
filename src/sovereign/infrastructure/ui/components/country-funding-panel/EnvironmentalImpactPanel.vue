<template>
    <section v-if="figures" class="environmental-impact-panel">
        <h3 class="legend-title">Environmental potential of {{ pillarLabel }}</h3>

        <div class="kpi-cards">
            <div class="kpi-card kpi-card--ghg">
                <div class="kpi-card-title">GHG Reduction</div>
                <div class="kpi-card-values">
                    <span v-for="figure in figures" :key="figure.meatType" class="kpi-value">
                        −{{ figure.ghgReductionPercent }}% ({{ capitalize(figure.meatType) }})
                    </span>
                </div>
            </div>

            <div class="kpi-card kpi-card--land">
                <div class="kpi-card-title">Land Saved</div>
                <div class="kpi-card-values">
                    <template v-for="figure in figures" :key="figure.meatType">
                        <span v-if="figure.landReductionPercent !== null" class="kpi-value">
                            −{{ figure.landReductionPercent }}% ({{ capitalize(figure.meatType) }})
                        </span>
                    </template>
                </div>
            </div>

            <div class="kpi-card kpi-card--water">
                <div class="kpi-card-title">Water Saved</div>
                <div class="kpi-card-values">
                    <template v-for="figure in figures" :key="figure.meatType">
                        <span v-if="figure.waterReductionPercent !== null" class="kpi-value">
                            −{{ figure.waterReductionPercent }}% ({{ capitalize(figure.meatType) }})
                        </span>
                    </template>
                </div>
            </div>
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

function capitalize(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
}
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

.kpi-card {
    background: var(--muted-bg);
    border: 1px solid var(--muted-border);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
}

.kpi-card-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    margin-bottom: 8px;
}

.kpi-card-values {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.kpi-value {
    font-size: 13px;
    font-weight: 600;
}

.figure-source {
    font-size: 11px;
    font-style: italic;
    margin-top: 8px;
}
</style>
