<template>
    <div v-if="value !== null" class="metric-ring">
        <div class="metric-ring-circle">
            <svg class="metric-ring-svg" viewBox="0 0 36 36">
                <defs>
                    <linearGradient :id="gradientId" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" :style="{ stopColor: color }" />
                        <stop
                            offset="100%"
                            :style="{ stopColor: `color-mix(in srgb, ${color} 80%, black)` }"
                        />
                    </linearGradient>
                </defs>
                <circle
                    class="metric-ring-track"
                    cx="18"
                    cy="18"
                    r="15.9155"
                    :style="{ stroke: color }"
                />
                <circle
                    class="metric-ring-fill"
                    cx="18"
                    cy="18"
                    r="15.9155"
                    :stroke-dasharray="`${value} ${100 - value}`"
                    :style="{ stroke: `url(#${gradientId})` }"
                />
            </svg>
            <span class="metric-ring-value">−{{ value }}%</span>
        </div>
        <span v-if="icon" class="metric-ring-icon">{{ icon }}</span>
        <span class="metric-ring-label">{{ label }}</span>
    </div>
</template>

<script setup lang="ts">
import { useId } from 'vue';

withDefaults(
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
</script>

<style scoped>
.metric-ring {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
}

.metric-ring-circle {
    position: relative;
    width: 68px;
    height: 68px;
}

.metric-ring-svg {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
}

.metric-ring-track,
.metric-ring-fill {
    fill: none;
    stroke-width: 3;
}

.metric-ring-track {
    opacity: 0.15;
}

.metric-ring-fill {
    stroke-linecap: round;
}

.metric-ring-value {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 0.85rem;
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
