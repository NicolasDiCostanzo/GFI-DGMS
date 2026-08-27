<script setup lang="ts">
import type { EnrichedGrantRow, GrantTableColumn } from './GrantTable.types';
import CountryFundingPanelCard from './CountryFundingPanelCard.vue';
import StretchedSortControls from './StretchedSortControls.vue';

type ColumnKey = GrantTableColumn;

defineProps<{
    sortableColumns: ReadonlyArray<ColumnKey>;
    columnLabels: Record<ColumnKey, string>;
    sortColumn: ColumnKey | null;
    sortDirection: 'asc' | 'desc';
    rows: ReadonlyArray<EnrichedGrantRow>;
    instrumentTextColor: string;
}>();

const emit = defineEmits<{
    'select-column': [column: ColumnKey | null];
    sort: [column: ColumnKey];
    'open-details': [grantId: string];
}>();
</script>

<template>
    <StretchedSortControls
        :sortable-columns="sortableColumns"
        :column-labels="columnLabels"
        :sort-column="sortColumn"
        :sort-direction="sortDirection"
        @select-column="emit('select-column', $event)"
        @sort="emit('sort', $event)"
    />
    <div class="grant-card-list" aria-label="Funding grants cards">
        <CountryFundingPanelCard
            v-for="row in rows"
            :key="row.grant.id"
            :grant="row.grant"
            :source-url="row.sourceUrl"
            :aim="row.aim"
            :instrument="row.instrument"
            :segments="row.segments"
            :instrument-text-color="instrumentTextColor"
            @open-details="emit('open-details', row.grant.id)"
        />
    </div>
</template>

<style scoped>
.grant-card-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
}
</style>
