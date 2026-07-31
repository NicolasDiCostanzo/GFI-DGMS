<script setup lang="ts">
import { toPercentage } from '@/shared/utils/toPercentage';
import { getColorForFundingProgress, type ThemeMode } from '@/sovereign/domain/constants/MapColors';
import type { Country } from '@/sovereign/domain/Country';
import type { SimulationResults } from '@/sovereign/domain/SimulationResults';
import { computed, watch } from 'vue';
import { useAnimatedCounter } from '../composables/useAnimatedCounter';
import { co2TonnesToCarsEquivalent, formatCarsEquivalent } from '../utils/co2Equivalent';
import { formatInvestment } from '../utils/formatInvestment';
import { isoToFlagEmoji } from '../utils/isoToFlagEmoji';

const props = withDefaults(
    defineProps<{
        country?: Country | null;
        results?: SimulationResults | null;
        sliderValue?: number;
        themeMode?: ThemeMode;
        isLoading?: boolean;
        error?: string | null;
    }>(),
    {
        country: null,
        results: null,
        sliderValue: 0,
        themeMode: 'dark',
        isLoading: false,
        error: null,
    },
);

const emit = defineEmits<{
    'update:sliderValue': [value: number];
    retry: [];
}>();

const sliderMax = computed(() => (props.country ? props.country.targetBudget.amount * 2 : 0));
const sliderMin = 0;

const { displayValue: animatedJobs, animateTo: animateJobs } = useAnimatedCounter();

const jobsTarget = computed(() => props.results?.additionalJobs ?? 0);

watch(
    jobsTarget,
    (target) => {
        animateJobs(target);
    },
    { immediate: true },
);

const flagEmoji = computed(() => (props.country ? isoToFlagEmoji(props.country.id) : ''));
const countryName = computed(() => props.country?.name ?? '');
const currentInvestment = computed(() => formatInvestment(props.sliderValue));

const fundingProgressPercent = computed(() => toPercentage(props.results!.fundingProgress));

const progressColor = computed(() =>
    getColorForFundingProgress(props.results!.fundingProgress, props.themeMode),
);

const co2Tonnes = computed(() => props.results!.additionalCO2Tonnes);
const carsEquivalent = computed(() =>
    formatCarsEquivalent(co2TonnesToCarsEquivalent(props.results!.additionalCO2Tonnes)),
);

const co2BarWidth = computed(() =>
    props.results ? Math.min((props.results.additionalCO2Tonnes / 4600) * 100, 100) : 0,
);

const baselineLabel = computed(() =>
    props.country ? `Baseline (${formatInvestment(props.country.baselineInvestment)})` : '',
);
const targetLabel = computed(() =>
    props.country ? `Target (${formatInvestment(props.country.targetBudget.amount)})` : '',
);
const maxLabel = computed(() =>
    props.country ? `200% (${formatInvestment(props.country.targetBudget.amount * 2)})` : '',
);

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
    <aside class="contextual-sidebar">
        <div v-if="error" class="error-state">
            <p class="error-message" role="alert">{{ error }}</p>
            <button class="retry-button" @click="emit('retry')">Retry</button>
        </div>

        <div v-else-if="isLoading" class="loading-state">
            <p class="sr-only" aria-live="polite">Loading country data</p>
            <div class="skeleton country-header-skeleton" aria-hidden="true" />
            <div class="skeleton slider-skeleton" aria-hidden="true" />
            <div class="skeleton progress-ring-skeleton" aria-hidden="true" />
            <div class="skeleton economic-skeleton" aria-hidden="true" />
            <div class="skeleton climate-skeleton" aria-hidden="true" />
        </div>

        <div v-else class="sidebar-content">
            <header class="country-header">
                <span class="country-flag">{{ flagEmoji }}</span>
                <span class="country-name">{{ countryName }}</span>
                <span class="current-investment">{{ currentInvestment }}</span>
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
                    <span class="slider-label">$0</span>
                    <span class="slider-label">{{ baselineLabel }}</span>
                    <span class="slider-label">{{ targetLabel }}</span>
                    <span class="slider-label">{{ maxLabel }}</span>
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
                    <div class="progress-text">
                        <span class="progress-percent">{{ fundingProgressPercent }}%</span>
                        <span class="progress-label">of Fair-Share Target</span>
                    </div>
                </div>

                <div class="economic-indicator">
                    <div class="economic-value">
                        <span class="jobs-sign">+</span>
                        <span class="jobs-count">{{ animatedJobs.toLocaleString('en-US') }}</span>
                    </div>
                    <div class="economic-label">Additional High-Tech Jobs</div>
                    <div class="economic-subtitle">Based on GFI economic projections</div>
                </div>

                <div class="climate-indicator">
                    <div class="co2-bar-container">
                        <div class="co2-bar" :style="{ width: `${co2BarWidth}%` }" />
                    </div>
                    <div class="co2-value">
                        {{ co2Tonnes.toLocaleString('en-US') }} Metric Tonnes CO₂ Saved Annually
                    </div>
                    <div class="co2-equivalent">{{ carsEquivalent }}</div>
                    <div class="co2-subtitle">Based on CE Delft LCA data</div>
                </div>
            </div>
        </div>
    </aside>
</template>

<style scoped>
.contextual-sidebar {
    width: 380px;
    background: var(--sidebar-bg, rgba(255, 255, 255, 0.95));
    border-left: 1px solid var(--border, #000000);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: -2px 0 8px rgba(0, 0, 0, 0.1);
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
    font-size: 14px;
}

.slider-labels {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
    color: var(--legend-text, #666);
}

.slider-label {
    font-size: 11px;
    color: var(--legend-text, #666);
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

.progress-text {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    text-align: center;
}

.progress-percent {
    font-size: 20px;
    font-weight: 700;
}

.progress-label {
    font-size: 12px;
    color: var(--legend-text, #666);
}

.economic-indicator,
.climate-indicator {
    text-align: center;
}

.economic-value {
    display: flex;
    align-items: baseline;
    justify-content: center;
    gap: 4px;
    font-size: 28px;
    font-weight: 700;
}

.jobs-sign {
    font-size: 20px;
}

.climate-indicator {
    margin-top: 16px;
}

.co2-bar-container {
    width: 100%;
    height: 12px;
    background: var(--progress-bg, #e0e0e0);
    border-radius: 6px;
    overflow: hidden;
    margin-bottom: 8px;
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
    color: var(--legend-text, #666);
    margin-bottom: 4px;
}

.co2-subtitle {
    font-size: 11px;
    color: var(--legend-text, #888);
}

.economic-label {
    font-size: 14px;
    font-weight: 600;
    margin-top: 4px;
}

.economic-subtitle {
    font-size: 11px;
    color: var(--legend-text, #888);
}

.empty-state,
.error-state,
.loading-state {
    padding: 20px;
    text-align: center;
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}

.skeleton {
    background: var(--progress-bg, #e0e0e0);
    border-radius: 4px;
    animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
    0%,
    100% {
        opacity: 0.6;
    }
    50% {
        opacity: 1;
    }
}

.country-header-skeleton {
    height: 24px;
    width: 60%;
    margin-bottom: 12px;
}

.slider-skeleton {
    height: 40px;
    width: 100%;
    margin-bottom: 12px;
}

.progress-ring-skeleton {
    height: 120px;
    width: 120px;
    margin: 0 auto 12px;
    border-radius: 50%;
}

.economic-skeleton {
    height: 28px;
    width: 80%;
    margin: 0 auto 8px;
}

.climate-skeleton {
    height: 60px;
    width: 100%;
}

.error-message {
    color: var(--error, #d32f2f);
    margin-bottom: 12px;
}

.retry-button {
    padding: 8px 16px;
    border: none;
    border-radius: 6px;
    background: var(--accent, #2196f3);
    color: white;
    cursor: pointer;
    font-size: 13px;
}

.retry-button:hover {
    opacity: 0.9;
}
</style>
