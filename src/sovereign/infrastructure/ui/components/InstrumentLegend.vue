<script setup lang="ts">
type Instrument = {
    family: string;
    color: string;
    label: string;
};

const props = defineProps<{ instruments?: readonly Instrument[] | null }>();
</script>

<template>
    <div class="legend instrument-legend">
        <span class="legend-title">Funding instrument</span>
        <span
            v-for="instrument in props.instruments"
            :key="instrument.family"
            class="legend-swatch"
        >
            <span class="swatch" :style="{ backgroundColor: instrument.color }"></span>
            <span class="swatch-label">{{ instrument.label }}</span>
        </span>
    </div>
</template>

<style scoped>
.legend {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.legend-title {
    font-weight: 600;
    margin-right: 4px;
}

.legend-swatch {
    display: inline-flex;
    align-items: center;
    gap: 4px;
}

.swatch {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 2px;
    border: 1px solid;
}

.swatch-label {
    white-space: nowrap;
}
</style>
