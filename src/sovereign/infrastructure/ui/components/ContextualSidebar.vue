<script setup lang="ts">
import { toPercentage } from '@/shared/utils/toPercentage';
import { getColorForFundingProgress, type ThemeMode } from '@/sovereign/domain/constants/MapColors';
import type { Country } from '@/sovereign/domain/Country';
import type { SimulationResults } from '@/sovereign/domain/SimulationResults';
import { computed } from 'vue';
import { co2TonnesToCarsEquivalent, formatCarsEquivalent } from '../utils/co2Equivalent';
import { formatInvestment } from '../utils/formatInvestment';
import { isoToFlagEmoji } from '../utils/isoToFlagEmoji';

const props = withDefaults(
    defineProps<{
        country?: Country | null;
        results?: SimulationResults | null;
        sliderValue?: number;
        themeMode?: ThemeMode;
    }>(),
    {
        country: null,
        results: null,
        sliderValue: 0,
        themeMode: 'dark',
    },
);

const emit = defineEmits<{
    'update:sliderValue': [value: number];
    close: [];
}>();

const sliderMax = computed(() => (props.country ? props.country.targetBudget.amount * 2 : 0));
const sliderMin = 0;

const jobsTarget = computed(() => props.results?.additionalJobs ?? 0);
const totalJobs = computed(() =>
    props.country ? props.country.currentNumberOfJobs + jobsTarget.value : 0,
);
const jobsDelta = computed(() =>
    props.country?.baselineInvestment !== props.sliderValue
        ? `${jobsTarget.value > 0 ? '+' : ''}${jobsTarget.value}`
        : '',
);

const flagEmoji = computed(() => (props.country ? isoToFlagEmoji(props.country.id) : ''));
const countryName = computed(() => props.country?.name ?? '');
const currentInvestment = computed(() => formatInvestment(props.sliderValue));

const fundingProgressPercent = computed(() => toPercentage(props.results?.fundingProgress ?? 0));

const progressColor = computed(() =>
    getColorForFundingProgress(props.results?.fundingProgress ?? 0, props.themeMode),
);

const co2Tonnes = computed(() => props.results?.additionalCO2Tonnes ?? 0);
const totalCO2 = computed(() =>
    props.country ? props.country.currentCO2Saved + co2Tonnes.value : 0,
);
const co2SavedDelta = computed(() =>
    props.country?.baselineInvestment !== props.sliderValue
        ? `${co2Tonnes.value > 0 ? '+' : ''}${co2Tonnes.value}`
        : '',
);
const carsEquivalent = computed(() =>
    formatCarsEquivalent(co2TonnesToCarsEquivalent(props.results?.additionalCO2Tonnes ?? 0)),
);

const baselineLabel = computed(() =>
    props.country ? `Baseline (${formatInvestment(props.country.baselineInvestment)})` : '',
);
const targetLabel = computed(() =>
    props.country ? `Target (${formatInvestment(props.country.targetBudget.amount)})` : '',
);
const maxLabel = computed(() =>
    props.country ? `200% (${formatInvestment(sliderMax.value)})` : '',
);

const sliderMarks = computed(() => {
    const marks = [
        {
            key: 'zero',
            value: 0,
            label: '$0',
            disabled: false,
        },
        {
            key: 'baseline',
            value: props.country?.baselineInvestment ?? 0,
            label: baselineLabel.value,
            disabled: !props.country,
        },
        {
            key: 'target',
            value: props.country?.targetBudget.amount ?? 0,
            label: targetLabel.value,
            disabled: !props.country,
        },
        {
            key: 'max',
            value: sliderMax.value,
            label: maxLabel.value,
            disabled: !props.country,
        },
    ];

    return marks.slice().sort((a, b) => a.value - b.value || a.key.localeCompare(b.key));
});

const CIRCLE_RADIUS = 45;
const CIRCLE_CENTER = 60;
const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;

const dashOffset = computed(() => {
    if (!props.results) return CIRCLE_CIRCUMFERENCE;
    const progress = Math.min(props.results.fundingProgress, 1);
    return CIRCLE_CIRCUMFERENCE * (1 - progress);
});
</script>

<template>
    <aside
        class="contextual-sidebar"
        :style="{ '--text': themeMode === 'dark' ? '#ffffff' : '#000000' }"
    >
        <button class="close-button" aria-label="Close sidebar" @click="emit('close')">
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
        <div class="sidebar-content">
            <header class="country-header">
                <span class="country-flag">{{ flagEmoji }}</span>
                <span class="country-name">{{ countryName }}</span>
            </header>

            <div class="slider-section">
                <div class="slider-value-display">{{ currentInvestment }}</div>
                <input
                    type="range"
                    role="slider"
                    aria-label="Investment amount in USD"
                    :aria-valuemin="String(sliderMin)"
                    :aria-valuemax="String(sliderMax)"
                    :aria-valuenow="String(sliderValue)"
                    :min="sliderMin"
                    :max="sliderMax"
                    :value="sliderValue"
                    @input="
                        emit(
                            'update:sliderValue',
                            Number(($event.target as HTMLInputElement).value),
                        )
                    "
                />
                <div class="slider-labels">
                    <button
                        v-for="mark in sliderMarks"
                        :key="mark.key"
                        class="slider-label"
                        :disabled="mark.disabled"
                        @click="emit('update:sliderValue', mark.value)"
                    >
                        {{ mark.label }}
                    </button>
                </div>
            </div>

            <div v-if="results" class="indicators">
                <div class="progress-ring-section">
                    <svg
                        width="120"
                        height="120"
                        role="img"
                        :aria-label="`${fundingProgressPercent}% funding progress`"
                    >
                        <circle
                            :cx="CIRCLE_CENTER"
                            :cy="CIRCLE_CENTER"
                            :r="CIRCLE_RADIUS"
                            fill="none"
                            stroke="var(--progress-bg, #e0e0e0)"
                            stroke-width="8"
                        />
                        <circle
                            :cx="CIRCLE_CENTER"
                            :cy="CIRCLE_CENTER"
                            :r="CIRCLE_RADIUS"
                            fill="none"
                            :stroke="progressColor"
                            stroke-width="8"
                            :stroke-dasharray="CIRCLE_CIRCUMFERENCE"
                            :stroke-dashoffset="dashOffset"
                            stroke-linecap="round"
                            :transform="`rotate(-90 ${CIRCLE_CENTER} ${CIRCLE_CENTER})`"
                        />
                    </svg>
                    <div class="progress-wrapper">
                        <div class="progress-text">{{ fundingProgressPercent }}%</div>
                        <div class="progress-label">of targeted funding</div>
                    </div>
                </div>

                <div class="economic-indicator">
                    <div class="economic-value">
                        <span class="jobs-count">{{
                            props.country?.baselineInvestment !== sliderValue
                                ? totalJobs
                                : props.country?.currentNumberOfJobs
                        }}</span>
                    </div>
                    <div class="economic-label">
                        <span
                            >people
                            {{
                                props.country?.baselineInvestment === sliderValue
                                    ? 'are currently'
                                    : 'would be'
                            }}
                            employed
                        </span>
                    </div>
                    <div class="economic-delta">{{ jobsDelta ? `${jobsDelta} jobs` : '' }}</div>
                    <div class="economic-subtitle">Based on GFI economic projections</div>
                </div>

                <div class="climate-indicator">
                    <div class="climate-value">
                        <span class="co2-count">{{
                            props.country?.baselineInvestment !== sliderValue
                                ? totalCO2
                                : props.country?.currentCO2Saved
                        }}</span>
                    </div>
                    <div class="climate-label">
                        <span
                            >tonnes of CO₂
                            {{
                                props.country?.baselineInvestment === sliderValue
                                    ? 'are currently'
                                    : 'would be'
                            }}
                            saved</span
                        >
                    </div>
                    <div v-if="carsEquivalent" class="co2-equivalent">
                        {{ carsEquivalent }}
                    </div>
                    <div class="co2-subtitle">Based on CE Delft LCA data</div>
                    <div class="climate-delta">
                        {{ co2SavedDelta ? `${co2SavedDelta} CO₂ saved` : '' }}
                    </div>
                </div>
            </div>
        </div>
    </aside>
</template>

<style scoped>
.sidebar-content {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.contextual-sidebar {
    width: 380px;
    background: var(--sidebar-bg, rgba(255, 255, 255, 0.95));
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: -8px 0 8px rgba(0, 0, 0, 0.1);
    color: var(--text);
    position: relative;
}

.close-button {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
}

.close-button:hover {
    background: rgba(128, 128, 128, 0.2);
}

.country-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 18px;
    font-weight: 600;
}

.country-flag {
    font-size: 24px;
}

.current-investment {
    margin-left: auto;
    font-weight: 700;
    color: var(--accent, #2196f3);
}

.slider-section {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.slider-value-display {
    font-weight: 600;
    text-align: center;
    font-size: 20px;
}

.slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
}

.slider-label {
    font-size: 11px;
}

input[type='range'] {
    width: 100%;
    accent-color: var(--accent, #2196f3);
}

.progress-ring-section {
    position: relative;
    width: 120px;
    height: 120px;
    margin: 0 auto;
}

.progress-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.progress-text {
    font-size: 20px;
    font-weight: 700;
}

.progress-percent {
    font-size: 20px;
    font-weight: 700;
}

.progress-label {
    font-size: 11px;
    font-style: italic;
}

.economic-indicator,
.climate-indicator {
    text-align: center;
}

.economic-value,
.climate-value {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
    font-size: 28px;
    font-weight: 700;
}

.climate-indicator {
    margin-top: 16px;
}

.co2-bar {
    height: 100%;
    background: var(--accent, #4caf50);
    border-radius: 6px;
    transition: width 0.3s ease;
}

.co2-value {
    font-size: 14px;
    font-weight: 600;
    margin-bottom: 4px;
}

.co2-equivalent {
    font-size: 13px;
    margin-bottom: 4px;
}

.co2-subtitle {
    font-size: 11px;
}

.economic-label,
.climate-label {
    font-size: 14px;
    font-weight: 600;
    margin-top: 4px;
}

.economic-subtitle,
.climate-subtitle {
    font-size: 11px;
}

.economic-delta,
.climate-delta {
    font-size: 16px;
    font-weight: 600;
    margin-top: 4px;
    color: var(--accent, #2196f3);
    min-height: 20px;
}
</style>
