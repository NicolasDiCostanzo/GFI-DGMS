<script setup lang="ts">
type Aim = {
    label: string;
    shortLabel: string;
    borderColor: string;
    backgroundColor: string;
    textColor: string;
};

type Instrument = {
    family: string;
    color: string;
    label: string;
};

const props = defineProps<{
    aims?: readonly Aim[] | null;
    instruments?: readonly Instrument[] | null;
}>();
</script>

<template>
    <div v-if="props.aims || props.instruments" class="legend-container">
        <div v-if="props.aims" class="legend aim-legend">
            <span class="legend-title">Aim</span>
            <span v-for="aim in props.aims" :key="aim.label" class="legend-swatch">
                <span
                    class="swatch"
                    :style="{ backgroundColor: aim.backgroundColor, borderColor: aim.borderColor }"
                ></span>
                <span class="swatch-label">{{ aim.shortLabel || aim.label }}</span>
            </span>
        </div>

        <div v-if="props.instruments" class="legend instrument-legend">
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
    </div>
</template>

<style scoped>
.legend-container {
    display: flex;
    flex-direction: column;
    gap: 16px;
}

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
    border: 1px solid currentColor;
}

.swatch-label {
    white-space: nowrap;
}
</style>
