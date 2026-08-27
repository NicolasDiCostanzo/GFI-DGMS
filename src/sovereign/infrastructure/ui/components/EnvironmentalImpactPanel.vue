<template>
    <section class="environmental-impact-panel" :style="cssVars">
        <div class="pillar-tabs-container">
            <TabSelector
                :options="PILLARS"
                :labels="PILLAR_LABELS"
                :model-value="selectedPillar"
                :accessibility-label="'Select production method for comparison'"
                @update:model-value="selectedPillar = $event"
            />
        </div>

        <h3 class="panel-title">{{ pillarLabel }} vs. conventional meat</h3>

        <TabSelector
            :options="MEAT_TYPES"
            :labels="MEAT_TYPE_LABELS"
            :model-value="selectedMeatType"
            :font-weight="600"
            :accessibility-label="'Select meat type for comparison'"
            @update:model-value="selectedMeatType = $event"
        />

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
import TabSelector from './TabSelector.vue';

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
    selectedPillar.value === 'Cultivated' ? 'Cultivated meat' : 'Plant-based meat',
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

.pillar-tabs-container {
    margin-bottom: 0.75rem;
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
