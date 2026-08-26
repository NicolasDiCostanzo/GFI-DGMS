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
    padding: 8px 12px;
    box-shadow: 0 1px 4px var(--border);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
}

.legend-swatch {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 2px;
    flex-shrink: 0;
}

.legend-label {
    font-size: 12px;
    color: var(--legend-text);
}
</style>
