<template>
    <div class="projection-card" :style="cssVars">
        <h4 class="projection-title">
            2040 Impact Projection
            <span class="scenario-tag">Moderate Policy Scenario</span>
        </h4>

        <div class="projection-metrics">
            <div class="metric-item">
                <span class="metric-value">€{{ projection.gvaEurBillions }}B</span>
                <span class="metric-label"> Annual Gross Value Added </span>
            </div>

            <div class="metric-divider"></div>

            <div class="metric-item">
                <span class="metric-value">{{ projection.jobs.toLocaleString('en-US') }}</span>
                <span class="metric-label">Jobs Created</span>
            </div>
        </div>

        <p class="projection-note">
            Estimated potential by 2040; independent of current public funding figures above.
        </p>
        <p class="projection-source">Source: Systemiq (2026), supported by GFI Europe</p>
    </div>
</template>

<script setup lang="ts">
import { useTheme } from '@/sovereign/infrastructure/ui/composables/useTheme';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { computed } from 'vue';

interface ProjectionProps {
    gvaEurBillions: number;
    jobs: number;
}

defineProps<{
    projection: ProjectionProps;
}>();

const { themeMode } = useTheme();

const cssVars = computed(() => {
    const colors = getThemeColors(themeMode.value);
    return {
        '--panel-border': colors.PANEL_BORDER,
        '--panel-border-strong': colors.PANEL_BORDER_STRONG,
        '--highlight': colors.HIGHLIGHT,
        '--highlight-bg': colors.HIGHLIGHT_BG,
        '--highlight-border': colors.HIGHLIGHT_BORDER,
    };
});
</script>

<style scoped>
.projection-card {
    padding: 1rem;
    border-radius: 8px;
    border: 1px solid var(--panel-border);
}

.projection-title {
    margin: 0 0 0.85rem 0;
    font-size: 0.85rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 0.5rem;
}

.scenario-tag {
    font-size: 0.7rem;
    font-weight: 500;
    color: var(--highlight);
    background-color: var(--highlight-bg);
    border: 1px solid var(--highlight-border);
    padding: 2px 8px;
    border-radius: 9999px;
}

.projection-metrics {
    display: flex;
    align-items: center;
    border: 1px solid var(--panel-border-strong);
    border-radius: 6px;
    padding: 0.75rem 1rem;
}

.metric-item {
    display: flex;
    flex-direction: column;
    flex: 1;
}

.metric-value {
    font-size: 1.15rem;
    font-weight: 700;
    line-height: 1.2;
}

.metric-label {
    font-size: 0.75rem;
    margin-top: 2px;
    display: flex;
    align-items: center;
    gap: 4px;
}

.metric-divider {
    width: 1px;
    height: 28px;
    margin: 0 1rem;
    background-color: var(--text);
}

.projection-note {
    font-size: 0.72rem;
    margin: 0.75rem 0 0 0;
    line-height: 1.3;
}

.projection-source {
    font-size: 0.7rem;
    margin: 0.25rem 0 0 0;
    font-style: italic;
}
</style>
