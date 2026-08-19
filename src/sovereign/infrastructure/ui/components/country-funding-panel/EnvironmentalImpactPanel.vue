<template>
    <section v-if="figures.length" class="environmental-impact-panel">
        <h3 class="legend-title">Environmental potential of {{ pillarLabel }}</h3>

        <div class="meat-type-tabs">
            <button
                v-for="type in MEAT_TYPES"
                :key="type"
                type="button"
                class="meat-type-tab"
                :class="{ 'meat-type-tab--active': type === selectedMeatType }"
                @click="selectedMeatType = type"
            >
                {{ MEAT_TYPE_LABELS[type] }}
            </button>
        </div>

        <div class="metric-rings">
            <div
                v-if="
                    selectedFigure?.ghgReductionPercent !== undefined &&
                    selectedFigure?.ghgReductionPercent !== null
                "
                class="metric-ring-slot metric-ring-slot--ghg"
            >
                <EnvironmentalMetricRing
                    :value="selectedFigure?.ghgReductionPercent"
                    label="GHG Reduction"
                    :color="ENVIRONMENTAL_METRIC_COLORS.ghg"
                    icon="🏭"
                />
            </div>
            <div
                v-if="
                    selectedFigure?.landReductionPercent !== undefined &&
                    selectedFigure?.landReductionPercent !== null
                "
                class="metric-ring-slot metric-ring-slot--land"
            >
                <EnvironmentalMetricRing
                    :value="selectedFigure?.landReductionPercent"
                    label="Land"
                    :color="ENVIRONMENTAL_METRIC_COLORS.land"
                    icon="🌱"
                />
            </div>
            <div
                v-if="
                    selectedFigure?.waterReductionPercent !== undefined &&
                    selectedFigure?.waterReductionPercent !== null
                "
                class="metric-ring-slot metric-ring-slot--water"
            >
                <EnvironmentalMetricRing
                    :value="selectedFigure?.waterReductionPercent"
                    label="Water"
                    :color="ENVIRONMENTAL_METRIC_COLORS.water"
                    icon="💧"
                />
            </div>
        </div>

        <p class="figure-source">{{ sourceText }}</p>
    </section>
</template>

<script setup lang="ts">
import type { Grant } from '@/sovereign/domain/Grant';
import {
    CULTIVATED_LCA_FIGURES,
    PLANT_BASED_LCA_FIGURES,
} from '@/sovereign/infrastructure/ui/constants/EnvironmentalImpactData';
import { ENVIRONMENTAL_METRIC_COLORS } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { resolveDominantProductionPillar } from '@/sovereign/infrastructure/ui/utils/resolveDominantProductionPillar';
import { computed, ref } from 'vue';
import EnvironmentalMetricRing from './EnvironmentalMetricRing.vue';

const MEAT_TYPES = ['beef', 'pork', 'chicken'] as const;
type MeatType = (typeof MEAT_TYPES)[number];

const MEAT_TYPE_LABELS: Record<MeatType, string> = {
    beef: 'Beef',
    pork: 'Pork',
    chicken: 'Chicken',
};

const props = withDefaults(
    defineProps<{
        grants?: readonly Grant[];
    }>(),
    {
        grants: () => [],
    },
);

const selectedMeatType = ref<MeatType>('beef');

const dominantPillar = computed(() => resolveDominantProductionPillar(props.grants));

const figures = computed(() => {
    if (dominantPillar.value === 'Plant-based') return PLANT_BASED_LCA_FIGURES;
    if (dominantPillar.value === 'Cultivated') return CULTIVATED_LCA_FIGURES;
    return [];
});

const selectedFigure = computed(
    () => figures.value.find((figure) => figure.meatType === selectedMeatType.value) ?? null,
);

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

<style scoped>
.environmental-impact-panel {
    border-top: 1px solid var(--muted-border);
    padding-top: 12px;
    font-size: 13px;
}

.meat-type-tabs {
    display: flex;
    background: var(--muted-bg);
    border: 1px solid var(--muted-border);
    border-radius: 999px;
    padding: 4px;
    margin-top: 12px;
}

.meat-type-tab {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text);
    font: inherit;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 999px;
    cursor: pointer;
}

.meat-type-tab--active {
    background: var(--accent);
    color: var(--on-accent);
}

.metric-rings {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: start;
    gap: 12px;
    margin-top: 16px;
}

.figure-source {
    font-size: 11px;
    font-style: italic;
    margin-top: 8px;
}
</style>
