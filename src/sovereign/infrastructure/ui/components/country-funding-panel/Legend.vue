<script setup lang="ts">
import { getAimLegend } from '@/sovereign/infrastructure/ui/constants/AimDisplay';

const legend = getAimLegend('dark');
</script>

<template>
    <div class="legend-card">
        <h4 class="legend-title">Funding objective</h4>
        <div class="legend-content">
            <div v-for="item in legend" :key="item.label" class="legend-item">
                <span class="color-bar" :style="{ backgroundColor: item.backgroundColor }"></span>
                <span class="swatch-label">{{ item.label }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.legend-card {
    padding: 0.5rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(127, 127, 127, 0.6);
}

.legend-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.25rem 0;
}

.color-bar {
    width: 16px;
    height: 16px;
    border-radius: 2px;
    flex-shrink: 0;
}

.swatch-label {
    white-space: nowrap;
    font-size: 0.8rem;
}
</style>
