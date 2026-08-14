<template>
    <div class="projection-section">
        <div class="projection-value">
            €{{ projection.gvaEurBillions }}bn/year GVA,
            {{ projection.jobs.toLocaleString('en-US') }} jobs
        </div>
        <div class="projection-label">
            Potential by 2040 under a Moderate Policy Support scenario — a single published
            projection, not derived from the funding total above.
        </div>
        <div class="projection-source">Source: Systemiq (2026), supported by GFI Europe</div>
    </div>
</template>

<script setup lang="ts">
interface ProjectionProps {
    gvaEurBillions: number;
    jobs: number;
}

defineProps<{
    projection: ProjectionProps;
}>();
</script>

<style scoped>
.projection-section {
    border-top: 1px solid var(--muted-border);
    border-bottom: 1px solid var(--muted-border);
    padding: 12px 0;
    font-size: 13px;
}

.projection-value {
    font-weight: 600;
    font-size: 15px;
}

.projection-label {
    margin-top: 4px;
}

.projection-source {
    font-size: 11px;
    font-style: italic;
    margin-top: 4px;
}
</style>
