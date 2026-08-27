<script setup lang="ts">
import type { EnrichedGrantRow, GrantTableColumn } from './GrantTable.types';
import GrantTableRow from './GrantTableRow.vue';
import SortControls from './SortControls.vue';

type ColumnKey = GrantTableColumn;

defineProps<{
    columns: ReadonlyArray<ColumnKey>;
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
    <SortControls
        :sortable-columns="sortableColumns"
        :column-labels="columnLabels"
        :sort-column="sortColumn"
        :sort-direction="sortDirection"
        @select-column="emit('select-column', $event)"
        @sort="emit('sort', $event)"
    />
    <div class="table-scroll-container" tabindex="0" aria-label="Funding grants table">
        <table class="grant-table">
            <thead>
                <tr>
                    <th v-for="col in columns" :key="col">
                        {{ columnLabels[col] ?? col }}
                    </th>
                </tr>
            </thead>
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

.grant-table th {
    padding: 10px 12px;
    font-size: 0.72rem;
    font-weight: 600;
    white-space: nowrap;
}
</style>
