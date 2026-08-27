<script setup lang="ts">
import type { EnrichedGrantRow } from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTable.types';

defineProps<{
    row: EnrichedGrantRow;
}>();
</script>

<template>
    <td class="platform-cell">
        <span v-for="segment in row.segments ?? []" :key="segment.label" class="platform-segment">
            {{ segment.label }}
        </span>
    </td>
</template>

<style scoped>
.platform-cell {
    display: flex;
    gap: 8px;
}

.platform-segment {
    display: inline-flex;
    align-items: center;
    height: 18px;
    padding: 0 4px;
    border-radius: 4px;
    border: 1px solid var(--border);
    color: var(--text);
    font-weight: 600;
    font-size: 0.68rem;
    white-space: nowrap;
}
</style>
