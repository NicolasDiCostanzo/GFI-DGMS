<script setup lang="ts">
import { CountryFunding } from '@/sovereign/domain/CountryFunding';
import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { computed, ref } from 'vue';
import { getAimLegend } from '../constants/AimDisplay';
import { getFundingInstrumentLegend } from '../constants/FundingInstrumentDisplay';
import { getThemeColors } from '../constants/ThemeColors';
import { formatInvestment } from '../utils/formatInvestment';
import AimLegend from './AimLegend.vue';
import CountryFundingPanelTable from './CountryFundingPanelTable.vue';
import CountryHeader from './CountryHeader.vue';
import EnvironmentalImpactPanel from './EnvironmentalImpactPanel.vue';
import InstrumentLegend from './InstrumentLegend.vue';
import PanelFooter from './PanelFooter.vue';
import PlatformLegend from './PlatformLegend.vue';
import ProjectionSection from './ProjectionSection.vue';

const AIRTABLE_SOURCE_URL =
    'https://airtable.com/app9etL9LpZ9MKX3v/shr3Czph4N1AWaE18/tblxsTk9dw1Kq1qid';

interface Country2040Projection {
    readonly gvaEurBillions: number;
    readonly jobs: number;
}

// Systemiq (2026), "Seizing the economic opportunity of alternative proteins in Europe" —
// Moderate Policy Support scenario, 2040. The only 3 countries with a published country-level
// projection; every other country only has the EU-wide figure (shown elsewhere, not here).
const COUNTRY_2040_PROJECTIONS: Readonly<Record<string, Country2040Projection>> = {
    France: { gvaEurBillions: 18, jobs: 64_000 },
    Italy: { gvaEurBillions: 10, jobs: 31_000 },
    Spain: { gvaEurBillions: 10, jobs: 34_000 },
};

const props = withDefaults(
    defineProps<{
        countryFunding?: CountryFunding | null;
        themeMode?: ThemeMode;
    }>(),
    {
        countryFunding: null,
        themeMode: 'dark',
    },
);

const emit = defineEmits<{
    close: [];
}>();

const isExpanded = ref(false);

const countryName = computed(() => props.countryFunding?.countryName ?? '');
const grants = computed(() => props.countryFunding?.grants ?? []);

const aimLegend = computed(() => getAimLegend(props.themeMode));
const instrumentLegend = computed(() => getFundingInstrumentLegend(props.themeMode));

const totalAmountLabel = computed(() =>
    props.countryFunding ? formatInvestment(props.countryFunding.totalAmountUsd / 1_000_000) : '',
);

const disclosureLabel = computed(() => {
    if (!props.countryFunding) return '';
    const { disclosedGrantCount, grants: countryGrants } = props.countryFunding;
    return `${disclosedGrantCount} of ${countryGrants.length} grants have a disclosed amount`;
});

const projection = computed(() => COUNTRY_2040_PROJECTIONS[countryName.value] ?? null);

const tableColumnOrder = [
    'projectTitle',
    'recipients',
    'amountUsd',
    'funderName',
    'funderAgencies',
    'fundingInstrument',
    'aim',
    'platform',
    'yearsDisbursed',
    'description',
    'url',
] as const;
const cssVars = computed(() => {
    const colors = getThemeColors(props.themeMode!);
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
</script>

<template>
    <aside class="country-funding-panel" :class="{ 'is-expanded': isExpanded }" :style="cssVars">
        <button
            class="expand-button"
            type="button"
            :aria-label="isExpanded ? 'Restore panel' : 'Expand panel'"
            :aria-expanded="isExpanded"
            @click="isExpanded = !isExpanded"
        >
            <svg
                v-if="!isExpanded"
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
                :disclosure-label="disclosureLabel"
            />

            <ProjectionSection v-if="projection" :projection="projection" />

            <EnvironmentalImpactPanel :grants="grants" />

            <div v-if="grants.length" class="table-legends">
                <AimLegend :aims="aimLegend" />
                <InstrumentLegend :instruments="instrumentLegend" />
                <PlatformLegend />
            </div>

            <CountryFundingPanelTable
                v-if="grants.length"
                :grants="grants"
                :theme-mode="props.themeMode"
                :column-order="tableColumnOrder"
            />

            <PanelFooter :source-url="AIRTABLE_SOURCE_URL" />
        </div>
    </aside>
</template>

<style scoped>
.panel-content {
    height: 100%;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
}

.country-funding-panel {
    position: absolute;
    top: 0;
    right: 0;
    bottom: 0;
    box-sizing: border-box;
    width: 380px;
    max-width: none;
    height: 100%;
    background: var(--sidebar-bg);
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: -8px 0 8px var(--panel-shadow);
    color: var(--text);
    overflow: hidden;
    transition:
        width 0.35s ease-in-out,
        box-shadow 0.35s ease-in-out;
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
</style>
