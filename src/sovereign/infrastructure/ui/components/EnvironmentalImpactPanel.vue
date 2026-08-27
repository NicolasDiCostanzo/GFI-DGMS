<template>
    <section class="environmental-impact-panel" :style="cssVars">
        <button class="close-button" type="button" aria-label="Close panel" @click="emit('close')">
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M2 2L14 14M2 14L14 2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </svg>
        </button>

        <div class="pillar-tabs-container">
            <TabSelector
                :options="PILLARS"
                :labels="PILLAR_LABELS"
                :model-value="selectedPillar"
                :accessibility-label="'Select production method for comparison'"
                @update:model-value="selectedPillar = $event"
            />
        </div>

        <div class="meat-tabs-container">
            <TabSelector
                :options="MEAT_TYPES"
                :labels="MEAT_TYPE_LABELS"
                :model-value="selectedMeatType"
                :font-weight="600"
                :accessibility-label="'Select meat type for comparison'"
                @update:model-value="selectedMeatType = $event"
            />
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

        <p class="figure-source">
            Compared to conventional meat production. <br /><a
                class="source-link"
                href="https://gfi.org/initiatives/climate/environmental-benefits-of-alt-proteins/"
                target="_blank"
                rel="noopener noreferrer"
                >Source</a
            >
        </p>
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

const emit = defineEmits<{
    close: [];
}>();

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
</script>

<style scoped>
.environmental-impact-panel {
    /* position: relative; */
    max-width: 315px;
    padding: 1.3rem;
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
    margin-bottom: 0.5rem;
}

.meat-tabs-container {
    padding: 0 1rem 0 1rem;
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
    font-size: 0.8rem;
    margin-top: 1rem;
    margin-bottom: 0;
    line-height: 1.3;
}

.source-link {
    color: var(--highlight);
}

.close-button {
    position: absolute;
    width: 18px;
    height: 18px;
    color: var(--text);
    cursor: pointer;
    transition: background-color 0.2s ease;
    padding: 3px;
    border-radius: 3px;
    top: 0.25rem;
    right: 0.25rem;
}

.close-button:hover {
    background: color-mix(in srgb, var(--text) 15%, transparent);
}
</style>
