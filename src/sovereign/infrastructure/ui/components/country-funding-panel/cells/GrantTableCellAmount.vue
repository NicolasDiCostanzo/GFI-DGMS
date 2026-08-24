<script setup lang="ts">
import { formatGrantAmount } from '@/sovereign/infrastructure/ui/utils/formatGrantAmount';
import { computed } from 'vue';
import type { EnrichedGrantRow } from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTable.types';

const props = defineProps<{
    row: EnrichedGrantRow;
}>();

const amountLabel = computed(() => formatGrantAmount(props.row.grant.amountUsd));
</script>

<template>
    <td class="amount-cell">
        {{ amountLabel }}
    </td>
</template>

<style scoped>
.amount-cell {
    font-weight: 600;
    white-space: nowrap;
}
</style>
