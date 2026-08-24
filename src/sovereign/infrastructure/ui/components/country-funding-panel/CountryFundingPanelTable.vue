<script lang="ts">
export type { GrantTableColumn as ColumnKey } from './GrantTable.types';
</script>

<script setup lang="ts">
import type { Grant } from '@/sovereign/domain/Grant';
import { useTheme } from '@/sovereign/infrastructure/ui/composables/useTheme';
import { getAimDisplay } from '@/sovereign/infrastructure/ui/constants/AimDisplay';
import { getFundingInstrumentDisplay } from '@/sovereign/infrastructure/ui/constants/FundingInstrumentDisplay';
import { getPlatformSegments } from '@/sovereign/infrastructure/ui/constants/ProductionPlatformSegments';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { formatGrantAmount } from '@/sovereign/infrastructure/ui/utils/formatGrantAmount';
import { computed, ref } from 'vue';
import CountryFundingPanelCard from './CountryFundingPanelCard.vue';
import GrantDetailsModal from './GrantDetailsModal.vue';
import type { EnrichedGrantRow, GrantTableColumn } from './GrantTable.types';
import { GRANT_TABLE_COLUMN_LABELS, GRANT_TABLE_COLUMN_ORDER } from './GrantTable.types';
import GrantTableRow from './GrantTableRow.vue';

type ColumnKey = GrantTableColumn;

const columnLabels = GRANT_TABLE_COLUMN_LABELS;

const props = defineProps<{
    grants: ReadonlyArray<Grant>;

    columnOrder?: ReadonlyArray<ColumnKey>;
}>();

const { themeMode, isDark } = useTheme();
const selectedGrantId = ref<string | null>(null);

function isValidHttpUrl(value: string): boolean {
    try {
        const url = new URL(value);
        return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
        return false;
    }
}

const grantsWithValidatedUrls = computed(() =>
    props.grants.map((grant: Grant) => ({
        grant,
        sourceUrl:
            grant.sourceUrl !== null && isValidHttpUrl(grant.sourceUrl) ? grant.sourceUrl : null,
    })),
);

const enrichedGrants = computed(() =>
    grantsWithValidatedUrls.value.map(({ grant, sourceUrl }) => ({
        grant,
        sourceUrl,
        aim: getAimDisplay(grant.aim, themeMode.value),
        instrument: getFundingInstrumentDisplay(grant.fundingInstrument, themeMode.value),
        segments: getPlatformSegments(grant.productionPlatforms),
    })),
);

function formatList(values: readonly string[]): string {
    return values.length > 0 ? values.join(', ') : 'Not specified';
}

const selectedGrant = computed(
    () => enrichedGrants.value.find((row) => row.grant.id === selectedGrantId.value) ?? null,
);

function openDetailsModal(grantId: string): void {
    selectedGrantId.value = grantId;
}

function closeDetailsModal(): void {
    selectedGrantId.value = null;
}

const instrumentTextColor = computed(() => {
    const colors = getThemeColors(themeMode.value);
    return isDark.value ? colors.ON_LIGHT : colors.ON_ACCENT;
});
const sortColumn = ref<ColumnKey | null>(null);
const sortDirection = ref<'asc' | 'desc'>('asc');

function handleSort(col: ColumnKey) {
    if (col === 'url' || col === 'description' || col === 'platform') {
        return;
    }
    if (sortColumn.value === col) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = col;
        sortDirection.value = 'asc';
    }
}

function getLastDisbursedYear(grant: Grant): number {
    const years = grant.yearsDisbursed
        .map((year) => Number(year))
        .filter((year) => Number.isFinite(year));
    return years.length > 0 ? Math.max(...years) : 0;
}

const sortedEnrichedGrants = computed(() => {
    if (sortColumn.value === null) {
        return enrichedGrants.value;
    }
    return enrichedGrants.value.slice().sort((a, b) => {
        const col = sortColumn.value as ColumnKey;
        if (col === 'yearsDisbursed') {
            const aNum = getLastDisbursedYear(a.grant);
            const bNum = getLastDisbursedYear(b.grant);
            return sortDirection.value === 'asc' ? aNum - bNum : bNum - aNum;
        }
        const aVal = getCellValue(col, a);
        const bVal = getCellValue(col, b);
        if (col === 'amountUsd') {
            const aNum = parseFloat(aVal.replace(/[^\d.-]/g, '') || '0');
            const bNum = parseFloat(bVal.replace(/[^\d.-]/g, '') || '0');
            return sortDirection.value === 'asc' ? aNum - bNum : bNum - aNum;
        }
        const aStr = aVal as string;
        const bStr = bVal as string;
        const normalize = (str: string) =>
            str
                .replace(/^\[RETRACTED\]/, '')
                .replace(/[^a-zA-Z0-9]/g, '')
                .toLowerCase();
        const aNorm = normalize(aStr);
        const bNorm = normalize(bStr);
        return sortDirection.value === 'asc'
            ? aNorm.localeCompare(bNorm)
            : bNorm.localeCompare(aNorm);
    });
});

const columns = computed<ReadonlyArray<ColumnKey>>(() =>
    props.columnOrder && props.columnOrder.length
        ? (props.columnOrder as ReadonlyArray<ColumnKey>)
        : GRANT_TABLE_COLUMN_ORDER,
);

function getCellValue(column: ColumnKey, eg: EnrichedGrantRow): string {
    const g = eg.grant;
    switch (column) {
        case 'projectTitle':
            return g.projectTitle ?? 'Not specified';
        case 'recipients':
            return g.recipients ?? 'Not specified';
        case 'amountUsd':
            return formatGrantAmount(g.amountUsd ?? null);
        case 'funderName':
            return g.funderName ?? 'Not specified';
        case 'funderAgencies':
            return formatList((g.funderAgencies ?? []) as readonly string[]);
        case 'fundingInstrument':
            return String(g.fundingInstrument ?? 'Not specified');
        case 'platform':
            return String(eg.segments ?? 'Not specified');
        case 'yearsDisbursed':
            return String(g.yearsDisbursed ?? 'Not specified');
        case 'description':
            return g.description ?? 'Not specified';
        case 'url':
            return eg.sourceUrl ?? 'Not specified';
        default:
            return 'Not specified';
    }
}

defineExpose({
    enrichedGrants,
    getCellValue,
    columnLabels,
    instrumentTextColor,
});
</script>

<template>
    <div v-if="grants.length" class="table-card">
        <div class="table-scroll-container" tabindex="0" aria-label="Funding grants table">
            <table class="grant-table">
                <thead>
                    <tr>
                        <th
                            v-for="col in columns"
                            :key="col"
                            :class="{ sorted: col === sortColumn }"
                            @click="handleSort(col)"
                        >
                            {{ columnLabels[col] ?? col }}
                            <span v-if="col === sortColumn" class="sort-arrow">
                                {{ sortDirection === 'asc' ? '▴' : '▾' }}
                            </span>
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <GrantTableRow
                        v-for="row in sortedEnrichedGrants"
                        :key="row.grant.id"
                        :row="row"
                        :columns="columns"
                        :instrument-text-color="instrumentTextColor"
                        @open-details="openDetailsModal"
                    />
                </tbody>
            </table>
        </div>
        <div class="grant-card-list">
            <CountryFundingPanelCard
                v-for="row in enrichedGrants"
                :key="row.grant.id"
                :grant="row.grant"
                :source-url="row.sourceUrl"
                :aim="row.aim"
                :instrument="row.instrument"
                :segments="row.segments"
                :instrument-text-color="instrumentTextColor"
                @open-details="openDetailsModal(row.grant.id)"
            />
        </div>
        <GrantDetailsModal
            v-if="selectedGrant"
            :open="true"
            :grant="selectedGrant.grant"
            :source-url="selectedGrant.sourceUrl"
            @close="closeDetailsModal"
        />
    </div>
</template>

<style scoped>
.table-card {
    flex-shrink: 0;
    border-radius: 8px;
    overflow: hidden;
}

.table-scroll-container {
    width: 100%;
    overflow-x: auto;
}

.grant-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 0.75rem;
    text-align: left;
}

.grant-table th {
    padding: 10px 12px;
    font-size: 0.72rem;
    font-weight: 600;
    white-space: nowrap;
}

.grant-card-list {
    display: none;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
}

@container country-funding-panel (max-width: 599px) {
    .table-scroll-container {
        display: none;
    }

    .grant-card-list {
        display: flex;
    }
}
.sort-arrow {
    font-size: 0.7rem;
    margin-left: 2px;
    cursor: default;
}
.sorted {
    background-color: var(--bg-color);
    border-bottom: 2px solid var(--accent);
}
</style>
