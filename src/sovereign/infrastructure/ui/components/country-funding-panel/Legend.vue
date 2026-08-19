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
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #2a2a2a;
}

.legend-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
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
