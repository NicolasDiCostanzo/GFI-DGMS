<script setup lang="ts">
import metricRingSvg from '@/sovereign/infrastructure/ui/assets/metric-ring.svg?raw';
import { getMetricGradientEndColor } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { computed, useId } from 'vue';

const props = withDefaults(
    defineProps<{
        value: number | null;
        label: string;
        color: string;
        icon?: string;
    }>(),
    {
        icon: undefined,
    },
);

const gradientId = `metric-ring-gradient-${useId()}`;

const ringSvg = computed(() =>
    substituteTokens(metricRingSvg, {
        __GRADIENT_ID__: gradientId,
        __GRADIENT_START__: props.color,
        __GRADIENT_END__: getMetricGradientEndColor(props.color),
        __TRACK_STROKE__: props.color,
        __DASHARRAY__: `${props.value!} ${100 - props.value!}`,
    }),
);

function substituteTokens(template: string, tokens: Record<string, string>): string {
    return Object.entries(tokens).reduce(
        (markup, [token, replacement]) => markup.split(token).join(replacement),
        template,
    );
}
</script>

<template>
    <div v-if="value !== null" class="metric-ring">
        <div class="metric-ring-circle">
            <div class="metric-ring-svg-slot" v-html="ringSvg" />
            <span class="metric-ring-value">−{{ value }}%</span>
        </div>
        <span v-if="icon" class="metric-ring-icon">{{ icon }}</span>
        <span class="metric-ring-label">{{ label }}</span>
    </div>
</template>

<style scoped>
.metric-ring {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.metric-ring-circle {
    position: relative;
    width: 58px;
    height: 58px;
}

.metric-ring-svg-slot {
    position: absolute;
    inset: 0;
}

.metric-ring-circle :deep(.metric-ring-svg) {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.metric-ring-circle :deep(.metric-ring-track),
.metric-ring-circle :deep(.metric-ring-fill) {
    fill: none;
    stroke-width: 3;
}

.metric-ring-circle :deep(.metric-ring-track) {
    opacity: 0.15;
}

.metric-ring-circle :deep(.metric-ring-fill) {
    stroke-linecap: round;
}

.metric-ring-value {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.75rem;
    font-weight: 700;
}

.metric-ring-label {
    font-size: 0.75rem;
    font-weight: 500;
    text-align: center;
}

.metric-ring-icon {
    font-size: 0.85rem;
    line-height: 1;
}
</style>
