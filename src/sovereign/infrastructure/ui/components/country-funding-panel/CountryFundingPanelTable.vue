<script setup lang="ts">
export type { GrantTableColumn as ColumnKey } from './GrantTable.types';
import type { Grant } from '@/sovereign/domain/Grant';
import { useTheme } from '@/sovereign/infrastructure/ui/composables/useTheme';
import { getAimDisplay } from '@/sovereign/infrastructure/ui/constants/AimDisplay';
import { getFundingInstrumentDisplay } from '@/sovereign/infrastructure/ui/constants/FundingInstrumentDisplay';
import { getPlatformSegments } from '@/sovereign/infrastructure/ui/constants/ProductionPlatformSegments';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { formatGrantAmount } from '@/sovereign/infrastructure/ui/utils/formatGrantAmount';
import { formatList } from '@/sovereign/infrastructure/ui/utils/formatList';
import { sortGrantRows } from '@/sovereign/infrastructure/ui/utils/sortGrantRows';
import { validateSourceUrl } from '@/sovereign/infrastructure/ui/utils/validateSourceUrl';
import { computed, ref } from 'vue';
import GrantDetailsModal from './GrantDetailsModal.vue';
import type { EnrichedGrantRow, GrantTableColumn } from './GrantTable.types';
import {
    GRANT_TABLE_COLUMN_LABELS,
    GRANT_TABLE_COLUMN_ORDER,
    isSortableGrantTableColumn,
} from './GrantTable.types';
import ExpandedGrantView from './ExpandedGrantView.vue';
import StretchedGrantView from './StretchedGrantView.vue';

type ColumnKey = GrantTableColumn;

const columnLabels = GRANT_TABLE_COLUMN_LABELS;

const props = defineProps<{
    grants: ReadonlyArray<Grant>;
    isCompactView: boolean;
    columnOrder?: ReadonlyArray<ColumnKey>;
}>();

const { themeMode, isDark } = useTheme();
const selectedGrantId = ref<string | null>(null);

const enrichedGrants = computed(() =>
    props.grants.map((grant: Grant) => ({
        grant,
        sourceUrl: validateSourceUrl(grant.sourceUrl),
        aim: getAimDisplay(grant.aim, themeMode.value),
        instrument: getFundingInstrumentDisplay(grant.fundingInstrument, themeMode.value),
        segments: getPlatformSegments(grant.productionPlatforms),
    })),
);

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
    if (!isSortableGrantTableColumn(col)) {
        return;
    }
    if (sortColumn.value === col) {
        sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn.value = col;
        sortDirection.value = 'asc';
    }
}

const sortableColumns = computed<ReadonlyArray<ColumnKey>>(() =>
    columns.value.filter(isSortableGrantTableColumn),
);

function onSelectColumn(column: ColumnKey | null): void {
    if (column === null) {
        sortColumn.value = null;
        return;
    }
    handleSort(column);
}

const sortedEnrichedGrants = computed(() => {
    if (sortColumn.value === null) {
        return enrichedGrants.value;
    }
    return sortGrantRows(enrichedGrants.value, sortColumn.value, sortDirection.value, getCellValue);
});

const columns = computed<ReadonlyArray<ColumnKey>>(() =>
    props.columnOrder && props.columnOrder.length
        ? (props.columnOrder as ReadonlyArray<ColumnKey>)
        : GRANT_TABLE_COLUMN_ORDER,
);

const viewProps = computed(() => ({
    columnLabels,
    sortColumn: sortColumn.value,
    sortDirection: sortDirection.value,
    rows: sortedEnrichedGrants.value,
    instrumentTextColor: instrumentTextColor.value,
}));

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
    <div v-if="grants.length" ref="viewEl" class="table-card">
        <StretchedGrantView
            v-if="isCompactView"
            v-bind="viewProps"
            :sortable-columns="sortableColumns"
            @select-column="onSelectColumn"
            @sort="handleSort"
            @open-details="openDetailsModal"
        />
        <ExpandedGrantView
            v-else
            v-bind="viewProps"
            :columns="columns"
            @sort="handleSort"
            @open-details="openDetailsModal"
        />
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
</style>
