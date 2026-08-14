<script setup lang="ts"></script>

<template>
    <div class="legend platform-legend">
        <span class="legend-title">Production platform</span>
        <span class="platform-segment">PB = Plant-based</span>
        <span class="platform-segment">CM = Cultivated</span>
        <span class="platform-segment">FM = Fermentation</span>
    </div>
</template>

<style scoped>
.platform-legend {
    display: inline-flex;
    align-items: center;
    gap: 6px;
}

.platform-segment {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 28px;
    height: 20px;
    padding: 0 6px;
    border-radius: 2px;
    background: var(--legend-bg);
    color: var(--legend-text);
    font-weight: 600;
    font-size: 12px;
}
</style>
