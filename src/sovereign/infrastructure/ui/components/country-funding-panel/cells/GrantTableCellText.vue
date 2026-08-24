<script setup lang="ts">
defineProps<{
    text: string;
    singleLine?: boolean;
    tdClass?: string;
}>();
</script>

<template>
    <td :class="tdClass">
        <div class="clamped-text" :class="{ 'single-line': singleLine }">
            {{ text }}
        </div>
    </td>
</template>

<style scoped>
.clamped-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.single-line {
    -webkit-line-clamp: 1;
    line-clamp: 1;
}

.title-cell {
    font-weight: 600;
}
</style>
