<template>
    <div class="kpi-card" :class="variant ? `kpi-card--${variant}` : ''">
        <div class="kpi-card-title">{{ title }}</div>
        <div class="kpi-card-values">
            <span v-for="figure in visibleFigures" :key="figure.label" class="kpi-value">
                −{{ figure.value }}% ({{ figure.label }})
            </span>
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface KpiFigure {
    readonly label: string;
    readonly value: number | null;
}

const props = withDefaults(
    defineProps<{
        title: string;
        figures: readonly KpiFigure[];
        variant?: string;
    }>(),
    {
        variant: undefined,
    },
);

const visibleFigures = computed(() => props.figures.filter((figure) => figure.value !== null));
</script>

<style scoped>
.kpi-card {
    background: var(--muted-bg);
    border: 1px solid var(--muted-border);
    border-radius: 8px;
    padding: 12px;
    text-align: center;
}

.kpi-card-title {
    font-size: 12px;
    font-weight: 600;
    color: var(--muted);
    margin-bottom: 8px;
}

.kpi-card-values {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.kpi-value {
    font-size: 13px;
    font-weight: 600;
}
</style>
