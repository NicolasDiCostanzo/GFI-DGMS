<template>
    <section v-if="figures.length" class="environmental-impact-panel" :style="cssVars">
        <h3 class="panel-title">Environmental impact: {{ pillarLabel }} vs. conventional meat</h3>

        <div class="meat-type-tabs" role="tablist" aria-label="Select meat type for comparison">
            <button
                v-for="type in MEAT_TYPES"
                :key="type"
                type="button"
                role="tab"
                :aria-selected="type === selectedMeatType"
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
                class="metric-ring-slot"
            >
                <EnvironmentalMetricRing
                    :value="selectedFigure?.ghgReductionPercent"
                    label="GHG emissions"
                    :color="ENVIRONMENTAL_METRIC_COLORS.ghg"
                    icon="🏭"
                />
            </div>
            <div
                v-if="
                    selectedFigure?.landReductionPercent !== undefined &&
                    selectedFigure?.landReductionPercent !== null
                "
                class="metric-ring-slot"
            >
                <EnvironmentalMetricRing
                    :value="selectedFigure?.landReductionPercent"
                    label="Land use"
                    :color="ENVIRONMENTAL_METRIC_COLORS.land"
                    icon="🌱"
                />
            </div>
            <div
                v-if="
                    selectedFigure?.waterReductionPercent !== undefined &&
                    selectedFigure?.waterReductionPercent !== null
                "
                class="metric-ring-slot"
            >
                <EnvironmentalMetricRing
                    :value="selectedFigure?.waterReductionPercent"
                    label="Water use"
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
} from '@/sovereign/domain/constants/EnvironmentalImpactFigures';
import {
    ENVIRONMENTAL_METRIC_COLORS,
    getThemeColors,
} from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { useTheme } from '@/sovereign/infrastructure/ui/composables/useTheme';
import { resolveDominantProductionPillar } from '@/sovereign/domain/services/resolveDominantProductionPillar';
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

const { themeMode } = useTheme();

const cssVars = computed(() => {
    const colors = getThemeColors(themeMode.value);
    return {
        '--panel-border': colors.PANEL_BORDER,
        '--panel-border-strong': colors.PANEL_BORDER_STRONG,
        '--highlight': colors.HIGHLIGHT,
    };
});

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
        ? 'cultivated meat (renewable energy)'
        : 'plant-based meat',
);

const sourceText = computed(() => {
    const commonText =
        'Savings compared to conventional meat production; not tied to specific grants.';
    return dominantPillar.value === 'Cultivated'
        ? `${commonText} Source: CE Delft.`
        : `${commonText} Source: GFI.`;
});
</script>

<style scoped>
.environmental-impact-panel {
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--panel-border);
}

.panel-title {
    margin: 0 0 0.75rem 0;
    font-size: 0.85rem;
    font-weight: 600;
}

.meat-type-tabs {
    display: flex;
    border: 1px solid var(--panel-border-strong);
    border-radius: 9999px;
    padding: 3px;
}

.meat-type-tab {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text);
    font-size: 0.75rem;
    font-weight: 600;
    padding: 6px 12px;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
}

.meat-type-tab--active {
    background: var(--highlight);
}

.metric-rings {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    align-items: start;
    gap: 0.75rem;
    margin-top: 1rem;
}

.metric-ring-slot {
    display: flex;
    justify-content: center;
}

.figure-source {
    font-size: 0.7rem;
    margin-top: 0.75rem;
    margin-bottom: 0;
    line-height: 1.3;
}
</style>
