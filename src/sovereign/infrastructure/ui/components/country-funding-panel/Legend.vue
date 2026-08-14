<script setup lang="ts">
import { getAimLegend } from '../../constants/AimDisplay';

const legend = getAimLegend('dark');
</script>

<template>
    <span class="legend-title">Aim</span>
    <div class="aim-legend">
        <div
            v-for="item in legend"
            :key="item.label"
            class="legend-swatch"
            :style="{ backgroundColor: item.backgroundColor }"
        >
            <span class="swatch-label">{{ item.label }}</span>
        </div>
    </div>
</template>

<style scoped>
.aim-legend {
    display: flex;
    flex-direction: column;
}

.legend-swatch {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    border-radius: 4px;
    padding: 2px 4px;
    margin-bottom: 4px;
}

.swatch-label {
    white-space: nowrap;
}
</style>
