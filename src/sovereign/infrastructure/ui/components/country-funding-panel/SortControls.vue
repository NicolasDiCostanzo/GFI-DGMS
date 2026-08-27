<script setup lang="ts">
import { computed } from 'vue';
import type { GrantTableColumn } from './GrantTable.types';

type ColumnKey = GrantTableColumn;

const props = defineProps<{
    sortableColumns: ReadonlyArray<ColumnKey>;
    columnLabels: Record<ColumnKey, string>;
    sortColumn: ColumnKey | null;
    sortDirection: 'asc' | 'desc';
}>();

const emit = defineEmits<{
    'select-column': [column: ColumnKey | null];
    sort: [column: ColumnKey];
}>();

const selectedSortColumn = computed<ColumnKey | ''>({
    get: () => props.sortColumn ?? '',
    set: (value) => {
        emit('select-column', value === '' ? null : value);
    },
});
</script>

<template>
    <div class="card-sort-bar">
        <label for="card-sort-select" class="card-sort-label">Sort by</label>
        <select id="card-sort-select" v-model="selectedSortColumn" class="card-sort-select">
            <option value="">Default</option>
            <option v-for="col in sortableColumns" :key="col" :value="col">
                {{ columnLabels[col] ?? col }}
            </option>
        </select>
        <button
            v-if="sortColumn"
            type="button"
            class="card-sort-direction"
            :aria-label="sortDirection === 'asc' ? 'Sort descending' : 'Sort ascending'"
            @click="emit('sort', sortColumn)"
        >
            {{ sortDirection === 'asc' ? '▴' : '▾' }}
        </button>
    </div>
</template>

<style scoped>
.card-sort-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 12px 0;
    font-size: 0.75rem;
    box-sizing: border-box;
    max-width: 100%;
    width: 220px;
}

.card-sort-label {
    font-weight: 600;
    color: var(--text);
}

.card-sort-select {
    flex: 1;
    min-width: 0;
    padding: 4px 8px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--text);
    font-size: 0.75rem;
}

.card-sort-direction {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border: 1px solid var(--border);
    border-radius: 4px;
    background: transparent;
    color: var(--text);
    font-size: 0.75rem;
    cursor: pointer;
}

.card-sort-direction:hover {
    background: var(--muted-light);
}
</style>
