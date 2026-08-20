<script lang="ts">
import { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import type { Grant } from '@/sovereign/domain/Grant';
import { getAimDisplay } from '@/sovereign/infrastructure/ui/constants/AimDisplay';
import { getFundingInstrumentDisplay } from '@/sovereign/infrastructure/ui/constants/FundingInstrumentDisplay';
import { getPlatformSegments } from '@/sovereign/infrastructure/ui/constants/ProductionPlatformSegments';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { formatGrantAmount } from '@/sovereign/infrastructure/ui/utils/formatGrantAmount';
import { computed, defineComponent, PropType, ref } from 'vue';
import CountryFundingPanelCard from './CountryFundingPanelCard.vue';
import GrantDetailsModal from './GrantDetailsModal.vue';

const DEFAULT_COLUMN_ORDER = [
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
export type ColumnKey = (typeof DEFAULT_COLUMN_ORDER)[number];

export default defineComponent({
    components: {
        CountryFundingPanelCard,
        GrantDetailsModal,
    },
    props: {
        grants: {
            type: Array as PropType<ReadonlyArray<Grant>>,
            required: true,
        },
        themeMode: {
            type: String as PropType<ThemeMode>,
            required: true,
        },
        columnOrder: {
            type: Array as PropType<ReadonlyArray<ColumnKey>>,
            required: false,
            default: () => DEFAULT_COLUMN_ORDER,
        },
    },
    setup(props) {
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
                    grant.sourceUrl !== null && isValidHttpUrl(grant.sourceUrl)
                        ? grant.sourceUrl
                        : null,
            })),
        );

        const enrichedGrants = computed(() =>
            grantsWithValidatedUrls.value.map(({ grant, sourceUrl }) => ({
                grant,
                sourceUrl,
                aim: getAimDisplay(grant.aim, props.themeMode),
                instrument: getFundingInstrumentDisplay(grant.fundingInstrument, props.themeMode),
                segments: getPlatformSegments(grant.productionPlatforms),
            })),
        );

        function formatList(values: readonly string[]): string {
            return values.length > 0 ? values.join(', ') : 'Not specified';
        }

        const selectedGrant = computed(
            () =>
                enrichedGrants.value.find((row) => row.grant.id === selectedGrantId.value) ?? null,
        );

        function openDetailsModal(grantId: string): void {
            selectedGrantId.value = grantId;
        }

        function closeDetailsModal(): void {
            selectedGrantId.value = null;
        }

        const instrumentTextColor = computed(() => {
            const colors = getThemeColors(props.themeMode);
            const isDark = props.themeMode === 'dark' || props.themeMode === 'colorblind-dark';
            return isDark ? colors.ON_LIGHT : colors.ON_ACCENT;
        });

        const columnLabels: Record<ColumnKey, string> = {
            projectTitle: 'Title',
            recipients: 'Recipient(s)',
            amountUsd: 'Funding estimate',
            funderName: 'Funder name',
            fundingInstrument: 'Funding instrument',
            platform: 'Platform',
            funderAgencies: 'Funder agency',
            description: 'Description',
            yearsDisbursed: 'Years disbursed',
            url: 'URL',
        };

        const columns = computed<ReadonlyArray<ColumnKey>>(() =>
            props.columnOrder && props.columnOrder.length
                ? (props.columnOrder as ReadonlyArray<ColumnKey>)
                : DEFAULT_COLUMN_ORDER,
        );

        type EnrichedGrant = {
            grant: Grant;
            sourceUrl: string | null;
            instrument: ReturnType<typeof getFundingInstrumentDisplay>;
            segments: ReturnType<typeof getPlatformSegments>;
        };

        function getCellValue(column: ColumnKey, eg: EnrichedGrant): string {
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

        return {
            enrichedGrants,
            formatGrantAmount,
            formatList,
            selectedGrant,
            openDetailsModal,
            closeDetailsModal,
            columns,
            columnLabels,
            getCellValue,
            instrumentTextColor,
        };
    },
});
</script>

<template>
    <div v-if="grants.length" class="table-card">
        <div class="table-scroll-container" tabindex="0" aria-label="Funding grants table">
            <table class="grant-table">
                <thead>
                    <tr>
                        <th v-for="col in columns" :key="col">{{ columnLabels[col] ?? col }}</th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        v-for="row in enrichedGrants"
                        :key="row.grant.id"
                        class="grant-row grant-item"
                        :style="
                            row.aim
                                ? {
                                      'background-color': row.aim.backgroundColor,
                                      'border-color': row.aim.borderColor,
                                  }
                                : {}
                        "
                    >
                        <template v-for="col in columns" :key="col">
                            <td v-if="col === 'fundingInstrument'" class="instrument-cell">
                                <span
                                    class="instrument-chip"
                                    :style="{
                                        backgroundColor: row.instrument.color,
                                        color: instrumentTextColor,
                                    }"
                                >
                                    {{ row.instrument.label }}
                                </span>
                            </td>

                            <td v-else-if="col === 'platform'" class="platform-cell">
                                <span
                                    v-for="segment in row.segments ?? []"
                                    :key="segment.label"
                                    class="platform-segment"
                                    :class="{ 'is-active': segment.active }"
                                >
                                    {{ segment.label }}
                                </span>
                            </td>

                            <td v-else-if="col === 'funderAgencies'">
                                <div class="clamped-text">
                                    {{ formatList(row.grant.funderAgencies) }}
                                </div>
                            </td>

                            <td v-else-if="col === 'funderName'">
                                <div class="clamped-text">
                                    {{ row.grant.funderName ?? 'Not specified' }}
                                </div>
                            </td>

                            <td v-else-if="col === 'recipients'">
                                <div class="clamped-text">
                                    {{ row.grant.recipients ?? 'Not specified' }}
                                </div>
                            </td>

                            <td v-else-if="col === 'projectTitle'" class="title-cell">
                                <div class="clamped-text">
                                    {{ row.grant.projectTitle ?? 'Untitled grant' }}
                                </div>
                            </td>

                            <td v-else-if="col === 'description'" class="description-cell">
                                <div class="clamped-text">
                                    {{ row.grant.description ?? 'Not specified' }}
                                </div>
                                <button
                                    class="description-toggle"
                                    type="button"
                                    @click="openDetailsModal(row.grant.id)"
                                >
                                    View details
                                </button>
                            </td>

                            <td v-else-if="col === 'amountUsd'" class="amount-cell">
                                {{ formatGrantAmount(row.grant.amountUsd) }}
                            </td>

                            <td v-else-if="col === 'yearsDisbursed'">
                                <div class="clamped-text">
                                    {{ formatList(row.grant.yearsDisbursed) }}
                                </div>
                            </td>

                            <td v-else-if="col === 'url'" class="url-cell">
                                <a
                                    v-if="row.sourceUrl"
                                    class="grant-link"
                                    :href="row.sourceUrl"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    View announcement
                                </a>
                                <span v-else class="no-url">—</span>
                            </td>

                            <td v-else>{{ row.grant[col] ?? '—' }}</td>
                        </template>
                    </tr>
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
                :theme-mode="themeMode"
                @open-details="openDetailsModal(row.grant.id)"
            />
        </div>
        <GrantDetailsModal
            v-if="selectedGrant"
            :open="true"
            :title="selectedGrant.grant.projectTitle ?? 'Untitled grant'"
            :funder-name="selectedGrant.grant.funderName"
            :description="selectedGrant.grant.description"
            :source-url="selectedGrant.sourceUrl"
            :theme-mode="themeMode"
            @close="closeDetailsModal"
        />
    </div>
</template>

<style scoped>
.table-card {
    flex-shrink: 0;
    border-radius: 8px;
    border: 1px solid var(--accent-color);
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
    color: var(--text-color);
    text-align: left;
}

.grant-table th {
    padding: 10px 12px;
    border-bottom: 1px solid var(--accent-color);
    font-size: 0.72rem;
    font-weight: 600;
    color: var(--text-color);
    white-space: nowrap;
}

.grant-table td {
    height: 56px;
    box-sizing: border-box;
    padding: 10px 12px;
    border-bottom: 1px solid var(--accent-color);
    vertical-align: top;
    line-height: 1.4;
}

.clamped-text {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.description-cell .clamped-text {
    -webkit-line-clamp: 1;
    line-clamp: 1;
}

.grant-row {
    border-left: 4px solid transparent;
    transition: background-color 0.15s ease-in-out;
    box-shadow: 0 2px 4px rgba(127, 127, 127, 0.15);
}

.grant-row:hover {
    background-color: rgba(var(--accent-color-rgb), 0.1);
}

.grant-row:last-child td {
    border-bottom: none;
}

.title-cell {
    font-weight: 600;
    color: var(--text-color);
}

.amount-cell {
    font-weight: 600;
    color: var(--text-color);
    white-space: nowrap;
}

.instrument-chip {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    font-weight: 600;
    white-space: nowrap;
}

.platform-cell {
    display: flex;
    gap: 8px;
}

.platform-segment {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 24px;
    height: 18px;
    padding: 0 4px;
    border-radius: 4px;
    border: 1px solid var(--border);
    color: var(--text);
    font-weight: 600;
    font-size: 0.68rem;
}

.platform-segment.is-active {
    color: var(--text);
    background-color: var(--accent);
    border-color: var(--accent);
}

.description-cell {
    min-width: 200px;
    max-width: 280px;
    word-break: break-word;
}

.description-toggle {
    align-self: flex-start;
    background: none;
    border: none;
    padding: 0;
    color: var(--link);
    font-size: 0.75rem;
    font-weight: 500;
    cursor: pointer;

    &:hover {
        text-decoration: underline;
    }
}

.grant-link {
    color: var(--text-color);
    text-decoration: none;
    font-size: 0.75rem;
    font-weight: 500;
    white-space: nowrap;

    &:hover {
        text-decoration: underline;
    }
}

.no-url {
    color: var(--text-color);
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
</style>
