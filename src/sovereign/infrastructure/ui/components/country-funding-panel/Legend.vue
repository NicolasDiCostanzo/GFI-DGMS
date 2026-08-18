<script setup lang="ts">
import { getAimLegend } from '@/sovereign/infrastructure/ui/constants/AimDisplay';
const legend = getAimLegend('dark');
</script>
<template>
    <div class="legend-card">
        <h2 class="legend-title">Aim</h2>
        <div class="legend-content">
            <div
                v-for="item in legend"
                :key="item.label"
                class="legend-swatch"
                :style="{ backgroundColor: item.backgroundColor }"
            >
                <span class="swatch-label">{{ item.label }}</span>
            </div>
        </div>
    </div>
</template>
<style scoped>
.legend-card {
    padding: 1rem;
    border-radius: 8px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.692);
}

.legend-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    margin-top: 0;
}

.legend-content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.legend-swatch {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    border-radius: 4px;
    padding: 0.25rem 0.5rem;
}

.swatch-label {
    white-space: nowrap;
    font-size: 0.875rem;
}
</style>
