<script setup lang="ts">
import type { EnrichedGrantRow } from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTable.types';

defineProps<{
    row: EnrichedGrantRow;
    instrumentTextColor: string;
}>();
</script>

<template>
    <td class="instrument-cell">
        <span
            class="instrument-chip"
            :style="{ backgroundColor: row.instrument.color, color: instrumentTextColor }"
        >
            {{ row.instrument.label }}
        </span>
    </td>
</template>

<style scoped>
.instrument-chip {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
}
</style>
