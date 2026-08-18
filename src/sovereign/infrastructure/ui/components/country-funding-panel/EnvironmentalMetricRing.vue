<template>
    <div v-if="value !== null" class="metric-ring">
        <div class="metric-ring-circle">
            <svg class="metric-ring-svg" viewBox="0 0 36 36">
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
                    :style="{ stroke: color }"
                />
            </svg>
            <span class="metric-ring-value">−{{ value }}%</span>
        </div>
        <span class="metric-ring-label">{{ label }}</span>
        <span v-if="icon" class="metric-ring-icon">{{ icon }}</span>
    </div>
</template>

<script setup lang="ts">
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
    width: 72px;
    height: 72px;
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
    opacity: 0.2;
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
    font-size: 15px;
    font-weight: 700;
    color: var(--text);
}

.metric-ring-label {
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    text-align: center;
}

.metric-ring-icon {
    font-size: 14px;
    line-height: 1;
}
</style>
