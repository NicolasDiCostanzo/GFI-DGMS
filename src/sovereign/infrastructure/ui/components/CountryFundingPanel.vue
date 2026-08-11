<script setup lang="ts">
import { CountryFunding } from '@/sovereign/domain/CountryFunding';
import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { computed } from 'vue';
import EnvironmentalImpactPanel from './EnvironmentalImpactPanel.vue';
import { formatInvestment } from '../utils/formatInvestment';

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

const countryName = computed(() => props.countryFunding?.countryName ?? '');
const grants = computed(() => props.countryFunding?.grants ?? []);

const totalAmountLabel = computed(() =>
    props.countryFunding ? formatInvestment(props.countryFunding.totalAmountUsd / 1_000_000) : '',
);

const disclosureLabel = computed(() => {
    if (!props.countryFunding) return '';
    const { disclosedGrantCount, grants: countryGrants } = props.countryFunding;
    return `${disclosedGrantCount} of ${countryGrants.length} grants have a disclosed amount`;
});

const projection = computed(() => COUNTRY_2040_PROJECTIONS[countryName.value] ?? null);

function formatGrantAmount(amountUsd: number | null): string {
    return amountUsd === null ? 'Undisclosed' : formatInvestment(amountUsd / 1_000_000);
}

function formatList(values: readonly string[]): string {
    return values.length > 0 ? values.join(', ') : 'Not specified';
}
</script>

<template>
    <aside
        class="country-funding-panel"
        :style="{ '--text': themeMode === 'dark' ? '#ffffff' : '#000000' }"
    >
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
            <header class="country-header">
                <span class="country-name">{{ countryName }}</span>
            </header>

            <div class="total-section">
                <div class="total-value">{{ totalAmountLabel }}</div>
                <div class="total-label">total public R&amp;I funding tracked</div>
                <div class="disclosure-note">{{ disclosureLabel }}</div>
            </div>

            <div v-if="projection" class="projection-section">
                <div class="projection-value">
                    €{{ projection.gvaEurBillions }}bn/year GVA,
                    {{ projection.jobs.toLocaleString('en-US') }} jobs
                </div>
                <div class="projection-label">
                    Potential by 2040 under a Moderate Policy Support scenario — a single published
                    projection, not derived from the funding total above.
                </div>
                <div class="projection-source">
                    Source: Systemiq (2026), commissioned by GFI Europe
                </div>
            </div>

            <EnvironmentalImpactPanel :grants="grants" />

            <ul class="grant-list">
                <li v-for="grant in grants" :key="grant.id" class="grant-item">
                    <div class="grant-title">{{ grant.projectTitle ?? 'Untitled grant' }}</div>
                    <div class="grant-amount">{{ formatGrantAmount(grant.amountUsd) }}</div>
                    <dl class="grant-details">
                        <dt>Funder agency</dt>
                        <dd>{{ formatList(grant.funderAgencies) }}</dd>
                        <dt>Funder name</dt>
                        <dd>{{ grant.funderName ?? 'Not specified' }}</dd>
                        <dt>Recipient(s)</dt>
                        <dd>{{ grant.recipients ?? 'Not specified' }}</dd>
                        <dt>Description</dt>
                        <dd>{{ grant.description ?? 'Not specified' }}</dd>
                        <dt>Aim</dt>
                        <dd>{{ grant.aim ?? 'Not specified' }}</dd>
                        <dt>Production platform</dt>
                        <dd>{{ formatList(grant.productionPlatforms) }}</dd>
                        <dt>Years disbursed</dt>
                        <dd>{{ formatList(grant.yearsDisbursed) }}</dd>
                    </dl>
                    <a
                        v-if="grant.sourceUrl"
                        class="grant-link"
                        :href="grant.sourceUrl"
                        target="_blank"
                        rel="noopener noreferrer"
                        >View announcement</a
                    >
                </li>
            </ul>

            <footer class="panel-footer">
                <a
                    class="source-link"
                    :href="AIRTABLE_SOURCE_URL"
                    target="_blank"
                    rel="noopener noreferrer"
                    >Data source: SOGPR research funding tracker</a
                >
            </footer>
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
    width: 380px;
    background: var(--sidebar-bg, rgba(255, 255, 255, 0.95));
    padding: 20px;
    display: flex;
    flex-direction: column;
    gap: 16px;
    box-shadow: -8px 0 8px rgba(0, 0, 0, 0.1);
    color: var(--text);
    position: relative;
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
    background: rgba(128, 128, 128, 0.2);
}

.country-header {
    font-size: 18px;
    font-weight: 600;
}

.total-section {
    text-align: center;
}

.total-value {
    font-size: 28px;
    font-weight: 700;
}

.total-label {
    font-size: 13px;
}

.disclosure-note {
    font-size: 11px;
    font-style: italic;
    margin-top: 4px;
}

.projection-section {
    border-top: 1px solid rgba(128, 128, 128, 0.3);
    border-bottom: 1px solid rgba(128, 128, 128, 0.3);
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

.grant-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
}

.grant-item {
    border: 1px solid rgba(128, 128, 128, 0.3);
    border-radius: 6px;
    padding: 10px;
}

.grant-title {
    font-weight: 600;
    font-size: 14px;
}

.grant-amount {
    font-size: 13px;
    margin-top: 2px;
}

.grant-details {
    font-size: 12px;
    margin: 8px 0 0;
}

.grant-details dt {
    font-weight: 600;
    margin-top: 6px;
}

.grant-details dd {
    margin: 2px 0 0;
}

.grant-link {
    display: inline-block;
    margin-top: 8px;
    font-size: 12px;
}

.panel-footer {
    font-size: 11px;
    text-align: center;
}
</style>
