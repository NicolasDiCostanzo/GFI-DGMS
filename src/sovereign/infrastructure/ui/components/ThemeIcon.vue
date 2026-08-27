<script setup lang="ts">
import { type ThemeIconName, THEME_ICONS } from '@/sovereign/infrastructure/ui/utils/themeIcons';

const props = defineProps<{
    name: ThemeIconName;
}>();
</script>

<template>
    <span class="theme-icon" v-html="THEME_ICONS[props.name]" />
</template>

<style scoped>
.theme-icon :deep(svg) {
    width: 16px;
    height: 16px;
}
</style>
