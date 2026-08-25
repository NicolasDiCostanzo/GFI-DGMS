<script setup lang="ts">
import {
    COLORBLIND_FUNDING_PROGRESS_COLORS,
    type ThemeMode,
} from '@/sovereign/infrastructure/ui/constants/MapColors';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import type { ThemeIconName } from '@/sovereign/infrastructure/ui/utils/themeIcons';
import { computed, ref } from 'vue';
import ThemeIcon from './ThemeIcon.vue';

const props = defineProps<{
    modelValue: ThemeMode;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: ThemeMode];
}>();

const isOpen = ref(false);

const options: { value: ThemeMode; label: string; icon: ThemeIconName }[] = [
    { value: 'light', label: 'Light', icon: 'sun' },
    { value: 'dark', label: 'Dark', icon: 'moon' },
    { value: 'colorblind-light', label: 'Colorblind Light', icon: 'eye' },
    { value: 'colorblind-dark', label: 'Colorblind Dark', icon: 'eye-off' },
];

const currentLabel = computed(() => {
    return options.find((opt) => opt.value === props.modelValue)?.label ?? 'Dark';
});

const currentIcon = computed(() => {
    return options.find((opt) => opt.value === props.modelValue)?.icon ?? 'moon';
});

function getSwatchColor(value: ThemeMode): string {
    if (value.includes('colorblind')) {
        return COLORBLIND_FUNDING_PROGRESS_COLORS[0];
    }
    const colors = getThemeColors(value);
    return colors.OCEAN;
}

function select(value: ThemeMode): void {
    emit('update:modelValue', value);
    isOpen.value = false;
}
</script>

<template>
    <div class="theme-toggle" @mouseenter="isOpen = true" @mouseleave="isOpen = false">
        <button
            class="theme-toggle-button"
            aria-haspopup="listbox"
            :aria-expanded="isOpen"
            @click="isOpen = true"
        >
            <span class="theme-toggle-icon">
                <ThemeIcon :name="currentIcon" />
            </span>
            <span class="theme-toggle-label">{{ currentLabel }}</span>
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
                <span class="theme-toggle-option-icon">
                    <ThemeIcon :name="option.icon" />
                </span>
                <span class="theme-toggle-option-label">{{ option.label }}</span>
            </button>
        </div>
    </div>
</template>

<style scoped>
.theme-toggle {
    position: absolute;
    top: 16px;
    left: 16px;
    z-index: 100;
}

.theme-toggle-button {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: var(--sidebar-bg);
    color: var(--text);
    cursor: pointer;
    font-size: 13px;
}

.theme-toggle-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
}

.theme-toggle-label {
    font-weight: 500;
}

.theme-toggle-dropdown {
    position: absolute;
    top: 100%;
    background: var(--sidebar-bg);
    border: 1px solid var(--border);
    border-radius: 6px;
    padding: 4px;
    min-width: 160px;
    box-shadow: 0 2px 8px var(--panel-shadow);
}

.theme-toggle-option {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    border: none;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    font-size: 13px;
    text-align: left;
}

.theme-toggle-option-icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
}

.theme-toggle-option-label {
    flex: 1;
}

.theme-toggle-option.is-selected {
    background: var(--inactive);
}

.theme-toggle-swatch {
    display: inline-block;
    width: 14px;
    height: 14px;
    border-radius: 2px;
    border: 1px solid var(--inactive);
}
</style>
