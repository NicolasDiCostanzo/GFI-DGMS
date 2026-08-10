<script setup lang="ts">
import { type ThemeIconName, THEME_ICONS } from '../utils/themeIcons';

const props = defineProps<{
    name: ThemeIconName;
}>();
</script>

<template>
    <!-- eslint-disable-next-line vue/no-v-html -- safe: SVG strings are hardcoded, prop is type-safe -->
    <span class="theme-icon" v-html="THEME_ICONS[props.name]" />
</template>

<style scoped>
.theme-icon :deep(svg) {
    width: 16px;
    height: 16px;
}
</style>
