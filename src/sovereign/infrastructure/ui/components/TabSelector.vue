<template>
    <div class="tab-selector" role="tablist" :aria-label="props.accessibilityLabel">
        <button
            v-for="option in props.options"
            :key="option"
            type="button"
            role="tab"
            :aria-selected="option === props.modelValue"
            :style="{ fontWeight: props.fontWeight }"
            class="tab-selector-option"
            :class="{ 'tab-selector-option--active': option === props.modelValue }"
            @click="emit('update:modelValue', option)"
        >
            {{ props.labels[option] }}
        </button>
    </div>
</template>

<script setup lang="ts" generic="T extends string | number">
const props = withDefaults(
    defineProps<{
        options: readonly T[];
        labels: Readonly<Record<T, string>>;
        modelValue: T;
        accessibilityLabel: string;
        fontWeight?: number;
    }>(),
    {
        fontWeight: 700,
    },
);

const emit = defineEmits<{
    'update:modelValue': [value: T];
}>();
</script>

<style scoped>
.tab-selector {
    display: flex;
    border: 1px solid var(--panel-border-strong);
    border-radius: 9999px;
    padding: 3px;
}

.tab-selector-option {
    flex: 1;
    border: none;
    background: transparent;
    color: var(--text);
    font-size: 0.75rem;
    padding: 6px 12px;
    border-radius: 9999px;
    cursor: pointer;
    transition: all 0.15s ease-in-out;
}

.tab-selector-option--active {
    background: var(--highlight);
}
</style>
