<script setup lang="ts">
import { isSortableGrantTableColumn, type GrantTableColumn } from './GrantTable.types';

type ColumnKey = GrantTableColumn;

const props = defineProps<{
    columns: ReadonlyArray<ColumnKey>;
    columnLabels: Record<ColumnKey, string>;
    sortColumn: ColumnKey | null;
    sortDirection: 'asc' | 'desc';
}>();

const emit = defineEmits<{
    sort: [column: ColumnKey];
}>();

function labelFor(col: ColumnKey): string {
    return props.columnLabels[col] ?? col;
}
</script>

<template>
    <thead>
        <tr>
            <th
                v-for="col in columns"
                :key="col"
                :class="{ sorted: col === sortColumn }"
                :aria-sort="
                    col === sortColumn
                        ? sortDirection === 'asc'
                            ? 'ascending'
                            : 'descending'
                        : undefined
                "
            >
                <button
                    v-if="isSortableGrantTableColumn(col)"
                    type="button"
                    class="sort-button"
                    @click="emit('sort', col)"
                >
                    {{ labelFor(col) }}
                    <span v-if="col === sortColumn" class="sort-arrow">
                        {{ sortDirection === 'asc' ? '▴' : '▾' }}
                    </span>
                </button>
                <template v-else>{{ labelFor(col) }}</template>
            </th>
        </tr>
    </thead>
</template>

<style scoped>
th {
    padding: 10px 12px;
    font-size: 0.72rem;
    font-weight: 600;
    white-space: nowrap;
}

.sort-button {
    background: none;
    border: none;
    margin: 0;
    padding: 0;
    font: inherit;
    color: inherit;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
}

.sort-arrow {
    font-size: 0.7rem;
    margin-left: 2px;
    cursor: default;
}

.sorted {
    background-color: var(--bg-color);
    border-bottom: 2px solid var(--accent);
}
</style>
