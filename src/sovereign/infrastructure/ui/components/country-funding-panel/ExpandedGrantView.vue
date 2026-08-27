<script setup lang="ts">
import type { EnrichedGrantRow, GrantTableColumn } from './GrantTable.types';
import ExpandedSortControls from './ExpandedSortControls.vue';
import GrantTableRow from './GrantTableRow.vue';

type ColumnKey = GrantTableColumn;

defineProps<{
    columns: ReadonlyArray<ColumnKey>;
    columnLabels: Record<ColumnKey, string>;
    sortColumn: ColumnKey | null;
    sortDirection: 'asc' | 'desc';
    rows: ReadonlyArray<EnrichedGrantRow>;
    instrumentTextColor: string;
}>();

const emit = defineEmits<{
    sort: [column: ColumnKey];
    'open-details': [grantId: string];
}>();
</script>

<template>
    <div class="table-scroll-container" tabindex="0" aria-label="Funding grants table">
        <table class="grant-table">
            <ExpandedSortControls
                :columns="columns"
                :column-labels="columnLabels"
                :sort-column="sortColumn"
                :sort-direction="sortDirection"
                @sort="emit('sort', $event)"
            />
            <tbody>
                <GrantTableRow
                    v-for="row in rows"
                    :key="row.grant.id"
                    :row="row"
                    :columns="columns"
                    :instrument-text-color="instrumentTextColor"
                    @open-details="emit('open-details', $event)"
                />
            </tbody>
        </table>
    </div>
</template>

<style scoped>
.table-scroll-container {
    width: 100%;
    overflow-x: auto;
}

.grant-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
    text-align: left;
}
</style>
