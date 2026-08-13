<script setup lang="ts">
type Aim = {
    label: string;
    backgroundColor: string;
    borderColor: string;
};

const props = defineProps<{ aims?: readonly Aim[] | null }>();
</script>

<template>
    <div class="legend aim-legend">
        <span class="legend-title">Aim</span>
        <span v-for="aim in props.aims" :key="aim.label" class="legend-swatch">
            <span
                class="swatch"
                :style="{ backgroundColor: aim.backgroundColor, borderColor: aim.borderColor }"
            ></span>
            <span class="swatch-label">{{ aim.label }}</span>
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
