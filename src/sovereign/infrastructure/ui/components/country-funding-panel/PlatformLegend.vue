<script setup lang="ts">
const PLATFORM_SEGMENTS = [
    { code: 'PB', name: 'Plant-based' },
    { code: 'CM', name: 'Cultivated' },
    { code: 'FM', name: 'Fermentation' },
] as const;
</script>

<template>
    <div class="legend-card">
        <h4 class="legend-title">Technology platform</h4>
        <div class="legend-content">
            <div v-for="platform in PLATFORM_SEGMENTS" :key="platform.code" class="legend-item">
                <span class="badge">{{ platform.code }}</span>
                <span class="swatch-label">{{ platform.name }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.legend-card {
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid #2a2a2a;
}

.legend-content {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.legend-item {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.25rem 0;
}

.badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 18px;
    padding: 0 4px;
    border-radius: 4px;
    border: 1px solid #3a3a3a;
    color: var(--text);
    font-weight: 600;
    font-size: 0.7rem;
    flex-shrink: 0;
}

.swatch-label {
    white-space: nowrap;
    font-size: 0.8rem;
    color: var(--text);
}
</style>
