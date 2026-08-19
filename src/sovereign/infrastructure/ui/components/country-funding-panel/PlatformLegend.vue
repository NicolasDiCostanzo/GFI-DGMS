<script setup lang="ts">
const PLATFORM_SEGMENTS = ['PB = Plant-based', 'CM = Cultivated', 'FM = Fermentation'] as const;
</script>

<template>
    <div class="legend-card">
        <h2 class="legend-title">Production Platform Legend</h2>
        <div class="legend-content">
            <span
                v-for="segment in PLATFORM_SEGMENTS"
                :key="segment"
                class="legend-platform-segment"
            >
                {{ segment }}
            </span>
        </div>
    </div>
</template>

<style scoped>
.legend-card {
    border-radius: 8px;
    box-shadow: 2px 2px 8px rgba(0, 0, 0, 0.692);
}

.legend-title {
    font-size: 1.5rem;
    font-weight: 600;
    margin-bottom: 1rem;
    margin-top: 0;
}

.legend-content {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.legend-platform-segment {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 20px;
    padding: 0 6px;
    border-radius: 4px;
    background: var(--legend-bg);
    color: var(--legend-text);
    font-weight: 600;
    font-size: 0.875rem;
}
</style>
