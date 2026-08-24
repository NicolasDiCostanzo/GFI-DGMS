<script setup lang="ts">
import { CountryFunding } from '@/sovereign/domain/CountryFunding';
import { useCompactView } from '@/sovereign/infrastructure/ui/composables/useCompactView';
import { useMediaQuery } from '@/sovereign/infrastructure/ui/composables/useMediaQuery';
import { usePanelResize } from '@/sovereign/infrastructure/ui/composables/usePanelResize';
import { useTheme } from '@/sovereign/infrastructure/ui/composables/useTheme';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors.ts';
import { formatInvestment } from '@/sovereign/infrastructure/ui/utils/formatInvestment.ts';
import { computed, ref, watch } from 'vue';
import CountryFundingPanelTable from './CountryFundingPanelTable.vue';
import CountryHeader from './CountryHeader.vue';
import EnvironmentalImpactPanel from './EnvironmentalImpactPanel.vue';
import Legend from './Legend.vue';
import PanelFooter from './PanelFooter.vue';
import ProjectionSection from './ProjectionSection.vue';

const AIRTABLE_SOURCE_URL =
    'https://airtable.com/app9etL9LpZ9MKX3v/shr3Czph4N1AWaE18/tblxsTk9dw1Kq1qid';

interface Country2040Projection {
    readonly gvaEurBillions: number;
    readonly jobs: number;
}

const viewEl = ref<HTMLElement | null>(null);
const isCompactView = useCompactView(viewEl);

const COUNTRY_2040_PROJECTIONS: Readonly<Record<string, Country2040Projection>> = {
    France: { gvaEurBillions: 18, jobs: 64_000 },
    Italy: { gvaEurBillions: 10, jobs: 31_000 },
    Spain: { gvaEurBillions: 10, jobs: 34_000 },
};

const props = withDefaults(
    defineProps<{
        countryFunding?: CountryFunding | null;
    }>(),
    {
        countryFunding: null,
    },
);

const emit = defineEmits<{
    close: [];
}>();

const { themeMode } = useTheme();

const isExpanded = ref(false);
const isLegendExpanded = ref(false);

watch(
    [isCompactView, isExpanded],
    ([isCompact, expanded]) => {
        if (isCompact || expanded) isLegendExpanded.value = true;
    },
    { immediate: true },
);

const countryName = computed(() => props.countryFunding?.countryName ?? '');
const grants = computed(() => props.countryFunding?.grants ?? []);

const totalAmountLabel = computed(() =>
    props.countryFunding ? formatInvestment(props.countryFunding.totalAmountUsd / 1_000_000) : '',
);

const grantCountLabel = computed(() => {
    if (!props.countryFunding) return '';
    const { disclosedGrantCount, grants: countryGrants } = props.countryFunding;
    return `${disclosedGrantCount}/${countryGrants.length} grants`;
});

const projection = computed(() => COUNTRY_2040_PROJECTIONS[countryName.value] ?? null);

const tableColumnOrder = [
    'projectTitle',
    'recipients',
    'amountUsd',
    'funderName',
    'funderAgencies',
    'fundingInstrument',
    'platform',
    'yearsDisbursed',
    'description',
    'url',
] as const;

const cssVars = computed(() => {
    const colors = getThemeColors(themeMode.value);
    return {
        '--text': colors.TEXT,
        '--link': colors.LINK,
        '--on-link': colors.ON_LINK,
        '--sidebar-bg': colors.SIDEBAR_BG,
        '--legend-bg': colors.LEGEND_BG,
        '--legend-text': colors.LEGEND_TEXT,
        '--accent': colors.ACCENT,
        '--ocean': colors.OCEAN,
        '--inactive': colors.INACTIVE,
        '--border': colors.BORDER,
        '--tooltip-bg': colors.TOOLTIP_BG,
        '--tooltip-text': colors.TOOLTIP_TEXT,
        '--progress-bg': colors.PROGRESS_BG,
        '--error': colors.ERROR,
        '--panel-shadow': colors.PANEL_SHADOW,
        '--panel-shadow-strong': colors.PANEL_SHADOW_STRONG,
        '--muted-border': colors.MUTED_BORDER,
        '--muted': colors.MUTED,
        '--muted-bg': colors.MUTED_BG,
        '--muted-light': colors.MUTED_LIGHT,
        '--on-accent': colors.ON_ACCENT,
    } as Record<string, string>;
});

const containerEl = computed(() => viewEl.value?.parentElement ?? null);

const DEFAULT_PANEL_WIDTH = 380;
const panelWidth = ref(DEFAULT_PANEL_WIDTH);
const { startResize, isResizing, clamp, getMaxWidth } = usePanelResize(
    containerEl,
    (width: number) => {
        panelWidth.value = clamp(width);
    },
);

const isMobile = useMediaQuery('(max-width: 768px)');

function toggleExpanded(): void {
    isExpanded.value = !shouldShowExpandedState.value;

    if (!isExpanded.value) {
        panelWidth.value = clamp(DEFAULT_PANEL_WIDTH);
    }
}

const isMaxWidthExpanded = computed(() => panelWidth.value >= getMaxWidth() - 1);
const shouldShowExpandedState = computed(
    () => isExpanded.value || isMaxWidthExpanded.value || isMobile.value,
);

const panelStyle = computed(() => {
    if (shouldShowExpandedState.value) {
        return cssVars.value;
    }
    return { ...cssVars.value, width: `${panelWidth.value}px` };
});

const panelClasses = computed(() => ({
    'is-expanded': shouldShowExpandedState.value,
    'is-resizing': isResizing.value,
}));
</script>

<template>
    <aside ref="viewEl" class="country-funding-panel" :class="panelClasses" :style="panelStyle">
        <button
            v-if="!shouldShowExpandedState && !isMobile"
            class="resize-handle"
            type="button"
            aria-label="Resize panel width"
            @mousedown="startResize"
        />
        <button
            v-if="!isMobile"
            class="expand-button"
            type="button"
            :aria-label="shouldShowExpandedState ? 'Restore panel' : 'Expand panel'"
            :aria-expanded="shouldShowExpandedState"
            @click="toggleExpanded"
        >
            <svg
                v-if="!shouldShowExpandedState"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M1 6V1H6M15 6V1H10M1 10V15H6M15 10V15H10"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
            <svg
                v-else
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M6 1V6H1M10 1V6H15M6 15V10H1M10 15V10H15"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                />
            </svg>
        </button>
        <button class="close-button" aria-label="Close panel" @click="emit('close')">
            <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M2 2L14 14M2 14L14 2"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                />
            </svg>
        </button>
        <div class="panel-content">
            <CountryHeader
                :country-name="countryName"
                :total-amount-label="totalAmountLabel"
                :grant-count-label="grantCountLabel"
            />
            <ProjectionSection v-if="projection" :projection="projection" />
            <div class="sub-header-wrapper" :class="isCompactView ? 'is-compact' : ''">
                <EnvironmentalImpactPanel :grants="grants" />
                <button
                    class="legend-label"
                    type="button"
                    :aria-expanded="isLegendExpanded"
                    @click="isLegendExpanded = !isLegendExpanded"
                >
                    Legend:
                    <span class="legend-chevron" :class="{ 'is-collapsed': !isLegendExpanded }"
                        >▾</span
                    >
                </button>
                <Legend v-if="isLegendExpanded || !isCompactView" />
            </div>
            <CountryFundingPanelTable
                v-if="grants.length"
                :grants="grants"
                :is-compact-view="isCompactView"
                :column-order="tableColumnOrder"
            />

            <PanelFooter :source-url="AIRTABLE_SOURCE_URL" />
        </div>
    </aside>
</template>

<style>
.legend-title {
    margin: 0 0 0.75rem 0;
    font-size: 0.75rem;
    font-weight: 600;
}

.panel-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    gap: 16px;
}

.legend-label {
    font-size: 16px;
    font-weight: 600;
    margin-top: 12px;
    background: none;
    border: none;
    padding: 0;
    color: var(--text);
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    text-align: left;
}

.legend-chevron {
    display: inline-block;
    font-size: 0.8rem;
    transition: transform 0.2s ease;
}

.legend-chevron.is-collapsed {
    transform: rotate(-90deg);
}

.sub-header-wrapper {
    display: flex;
    flex-direction: column;
    gap: 8px;

    &:not(.is-compact) {
        flex-direction: row;

        > * {
            width: 50%;
        }

        .legend-label {
            display: none;
        }
    }
}

.country-funding-panel {
    container: country-funding-panel / inline-size;
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    box-sizing: border-box;
    width: 375px;
    height: 100%;
    background: var(--sidebar-bg);
    padding: 10px;
    box-shadow: -8px 0 8px var(--panel-shadow);

    overflow: hidden;
    transition:
        width 0.35s ease-in-out,
        box-shadow 0.35s ease-in-out;
}

.country-funding-panel.is-resizing {
    transition: box-shadow 0.35s ease-in-out;
}

.country-funding-panel.is-expanded {
    width: 100%;
    box-shadow: 0 0 16px var(--panel-shadow-strong);
}

.expand-button {
    position: absolute;
    top: 12px;
    right: 48px;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
}

.expand-button:hover {
    background: var(--muted-light);
}

.close-button {
    position: absolute;
    top: 12px;
    right: 12px;
    width: 32px;
    height: 32px;
    padding: 0;
    border: none;
    border-radius: 4px;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease;
}

.close-button:hover {
    background: var(--muted-light);
}

.resize-handle {
    position: absolute;
    left: 0;
    top: 0;
    bottom: 0;
    width: 8px;
    border: none;
    border-radius: 0;
    background: transparent;
    cursor: col-resize;
    z-index: 20;
}

.resize-handle:hover {
    background: var(--muted-light);
}
</style>
