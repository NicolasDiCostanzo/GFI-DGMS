<script setup lang="ts">
import type { LegendItem } from '@/sovereign/infrastructure/ui/utils/fundingAmountLegend';

defineProps<{
    items: readonly LegendItem[];
}>();
</script>

<template>
    <div class="map-legend">
        <div v-for="(entry, idx) in items" :key="idx" class="legend-item">
            <span class="legend-swatch" :style="{ backgroundColor: entry.color }" />
            <span class="legend-label">{{ entry.label }}</span>
        </div>
    </div>
</template>

<style scoped>
.map-legend {
    position: absolute;
    bottom: 16px;
    right: 16px;
    background: var(--legend-bg);
    border-radius: 6px;
    padding: 6px 8px;
    box-shadow: 0 1px 4px var(--border);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 4px;
}

.legend-swatch {
    width: 12px;
    height: 12px;
    border-radius: 2px;
}

.legend-label {
    font-size: 0.7rem;
    line-height: 12px;
    display: block;
    margin: 0;
    color: var(--legend-text);
}
</style>
