<script setup lang="ts">
import type { GrantTableColumn } from './GrantTable.types';

type ColumnKey = GrantTableColumn;

defineProps<{
    columns: ReadonlyArray<ColumnKey>;
    columnLabels: Record<ColumnKey, string>;
    sortColumn: ColumnKey | null;
    sortDirection: 'asc' | 'desc';
}>();

const emit = defineEmits<{
    sort: [column: ColumnKey];
}>();
</script>

<template>
    <thead>
        <tr>
            <th
                v-for="col in columns"
                :key="col"
                :class="{ sorted: col === sortColumn }"
                @click="emit('sort', col)"
            >
                {{ columnLabels[col] ?? col }}
                <span v-if="col === sortColumn" class="sort-arrow">
                    {{ sortDirection === 'asc' ? '▴' : '▾' }}
                </span>
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
