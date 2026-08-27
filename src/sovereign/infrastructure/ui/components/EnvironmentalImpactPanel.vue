<template>
    <section class="environmental-impact-panel" :style="cssVars">
        <div
            class="pillar-tabs"
            role="tablist"
            aria-label="Select production method for comparison"
        >
            <button
                v-for="pillar in PILLARS"
                :key="pillar"
                type="button"
                role="tab"
                :aria-selected="pillar === selectedPillar"
                class="pillar-tab"
                :class="{ 'pillar-tab--active': pillar === selectedPillar }"
                @click="selectedPillar = pillar"
            >
                {{ PILLAR_LABELS[pillar] }}
            </button>
        </div>

        <h3 class="panel-title">Conventional meat vs. {{ pillarLabel }}</h3>

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
                    icon="🌾"
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
import {
    CULTIVATED_LCA_FIGURES,
    PLANT_BASED_LCA_FIGURES,
} from '@/sovereign/domain/constants/EnvironmentalImpactFigures';
import type { ProductionPillar } from '@/sovereign/domain/services/resolveDominantProductionPillar';
import { useTheme } from '@/sovereign/infrastructure/ui/composables/useTheme';
import {
    ENVIRONMENTAL_METRIC_COLORS,
    getThemeColors,
} from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { computed, ref } from 'vue';
import EnvironmentalMetricRing from './EnvironmentalMetricRing.vue';

const MEAT_TYPES = ['beef', 'pork', 'chicken'] as const;
type MeatType = (typeof MEAT_TYPES)[number];

const MEAT_TYPE_LABELS: Record<MeatType, string> = {
    beef: 'Beef',
    pork: 'Pork',
    chicken: 'Chicken',
};

const PILLARS: readonly ProductionPillar[] = ['Plant-based', 'Cultivated'];

const PILLAR_LABELS: Record<ProductionPillar, string> = {
    'Plant-based': 'Plant-based 🌱',
    Cultivated: 'Cultivated meat 🧫',
};

const selectedPillar = ref<ProductionPillar>('Plant-based');
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

const figures = computed(() =>
    selectedPillar.value === 'Cultivated' ? CULTIVATED_LCA_FIGURES : PLANT_BASED_LCA_FIGURES,
);

const selectedFigure = computed(
    () => figures.value.find((figure) => figure.meatType === selectedMeatType.value) ?? null,
);

const pillarLabel = computed(() =>
    selectedPillar.value === 'Cultivated' ? 'cultivated meat' : 'plant-based meat',
);

const sourceText = computed(() => {
    const commonText =
        'Savings compared to conventional meat production; not tied to specific grants.';
    return selectedPillar.value === 'Cultivated'
        ? `${commonText} Source: CE Delft.`
        : `${commonText} Source: GFI.`;
});
</script>

<style scoped>
.environmental-impact-panel {
    max-width: 315px;
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--panel-border);
}

.panel-title {
    margin: 0 0 0.75rem 0;
    font-size: 0.85rem;
    font-weight: 600;
    text-align: center;
}

.pillar-tabs {
    display: flex;
    border: 1px solid var(--panel-border-strong);
    border-radius: 9999px;
    padding: 3px;
    margin-bottom: 0.75rem;
}

.pillar-tab {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text);
    font-size: 0.75rem;
    font-weight: 700;
    padding: 6px 12px;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
}

.pillar-tab--active {
    background: var(--highlight);
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
    font-size: 0.63rem;
    margin-top: 0.75rem;
    margin-bottom: 0;
    line-height: 1.3;
}
</style>
