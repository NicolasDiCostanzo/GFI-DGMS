<script setup lang="ts">
const props = defineProps<{
    modelValue: boolean;
}>();

const emit = defineEmits<{
    'update:modelValue': [value: boolean];
}>();

function toggle(): void {
    emit('update:modelValue', !props.modelValue);
}
</script>

<template>
    <button
        type="button"
        class="global-impact-benchmarks-toggle"
        :aria-expanded="modelValue"
        @click="toggle"
    >
        ⓘ Global Impact Benchmarks
    </button>
</template>

<style scoped>
.global-impact-benchmarks-toggle {
    position: absolute;
    top: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 0;
    padding: 6px 10px;
    border-radius: 9999px;
    border: 1px solid var(--border);
    background: var(--sidebar-bg);
    color: var(--text);
    cursor: pointer;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;
}
</style>
