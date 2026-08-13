<template>
    <footer class="panel-footer">
        <a class="source-link" :href="sourceUrl" target="_blank" rel="noopener noreferrer">
            Data source: SOGPR research funding tracker
        </a>
    </footer>
</template>

<script setup lang="ts">
defineProps<{
    sourceUrl: string;
}>();
</script>

<style scoped>
.panel-footer {
    font-size: 11px;
    text-align: center;
}

.source-link {
    color: var(--link, #1565c0);
    text-decoration: underline;
    text-underline-offset: 2px;
}

.source-link:hover {
    opacity: 0.7;
}
</style>
