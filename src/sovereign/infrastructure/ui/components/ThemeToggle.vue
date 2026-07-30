<script setup lang="ts">
import { computed, ref } from 'vue';
import {
    COLORBLIND_FUNDING_PROGRESS_COLORS,
    DARK_THEME_COLORS,
    LIGHT_THEME_COLORS,
    type ThemeMode,
} from '../../../domain/constants/MapColors';

const props = defineProps<{
    modelValue: ThemeMode;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: ThemeMode];
}>();

const isOpen = ref(false);

const options: { value: ThemeMode; label: string }[] = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'colorblind-light', label: 'Colorblind Light' },
    { value: 'colorblind-dark', label: 'Colorblind Dark' },
];

const currentLabel = computed(() => {
    return options.find((opt) => opt.value === props.modelValue)?.label ?? 'Dark';
});

function getSwatchColor(value: ThemeMode): string {
    if (value.includes('colorblind')) {
        return COLORBLIND_FUNDING_PROGRESS_COLORS[0];
    }
    if (value === 'light') {
        return LIGHT_THEME_COLORS.OCEAN;
    }
    return DARK_THEME_COLORS.OCEAN;
}

function select(value: ThemeMode): void {
    emit('update:modelValue', value);
}
</script>

<template>
    <div class="theme-toggle" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
        <button class="theme-toggle-button" aria-haspopup="listbox" :aria-expanded="isOpen">
            {{ currentLabel }}
        </button>
        <div v-if="isOpen" class="theme-toggle-dropdown" role="listbox">
            <button
                v-for="option in options"
                :key="option.value"
                class="theme-toggle-option"
                :class="{ 'is-selected': option.value === modelValue }"
                role="option"
                :aria-selected="option.value === modelValue"
                @click="select(option.value)"
            >
                <span
                    class="theme-toggle-swatch"
                    :style="{ backgroundColor: getSwatchColor(option.value) }"
                />
                {{ option.label }}
            </button>
        </div>
    </div>
</template>

<style scoped>
.theme-toggle {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 100;
}

.theme-toggle-button {
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid #ccc;
    background: rgba(255, 255, 255, 0.9);
    cursor: pointer;
    font-size: 13px;
}

.theme-toggle-dropdown {
    position: absolute;
    top: 100%;
    right: 0;
    background: rgba(255, 255, 255, 0.95);
    border: 1px solid #ccc;
    border-radius: 6px;
    padding: 4px;
    min-width: 160px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.theme-toggle-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    border: none;
    background: transparent;
    cursor: pointer;
    font-size: 13px;
    text-align: left;
}

.theme-toggle-option.is-selected {
    background: rgba(0, 0, 0, 0.05);
}

.theme-toggle-swatch {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 2px;
    border: 1px solid rgba(0, 0, 0, 0.2);
}
</style>
