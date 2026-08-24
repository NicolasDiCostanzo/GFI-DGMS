<script setup lang="ts">
import type { EnrichedGrantRow } from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTable.types';

defineProps<{
    row: EnrichedGrantRow;
}>();

defineEmits<{
    'open-details': [grantId: string];
}>();
</script>

<template>
    <td class="description-cell">
        <div class="clamped-text single-line">
            {{ row.grant.description ?? 'Not specified' }}
        </div>
        <button
            class="description-toggle"
            type="button"
            @click="$emit('open-details', row.grant.id)"
        >
            View details
        </button>
    </td>
</template>

<style scoped>
.description-cell {
    min-width: 200px;
    max-width: 280px;
    word-break: break-word;
}

.clamped-text {
    display: -webkit-box;
    -webkit-line-clamp: 1;
    line-clamp: 1;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.description-toggle {
    align-self: flex-start;
    background: none;
    border: none;
    padding: 0;
    color: var(--link);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
}
</style>
