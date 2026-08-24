<script setup lang="ts">
import type { EnrichedGrantRow } from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTable.types';

defineProps<{
    row: EnrichedGrantRow;
}>();
</script>

<template>
    <td class="url-cell">
        <a
            v-if="row.sourceUrl"
            class="grant-link"
            :href="row.sourceUrl"
            target="_blank"
            rel="noopener noreferrer"
        >
            View announcement
        </a>
        <span v-else class="no-url">—</span>
    </td>
</template>

<style scoped>
.grant-link {
    text-decoration: none;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
    color: var(--link);

    &:hover {
        text-decoration: underline;
    }
}
</style>
