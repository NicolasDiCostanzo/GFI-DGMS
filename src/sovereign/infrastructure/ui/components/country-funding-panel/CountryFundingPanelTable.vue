<script lang="ts">
import { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import type { Grant } from '@/sovereign/domain/Grant';
import { getAimDisplay } from '@/sovereign/infrastructure/ui/constants/AimDisplay';
import { getFundingInstrumentDisplay } from '@/sovereign/infrastructure/ui/constants/FundingInstrumentDisplay';
import { getPlatformSegments } from '@/sovereign/infrastructure/ui/constants/ProductionPlatformSegments';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { formatInvestment } from '@/sovereign/infrastructure/ui/utils/formatInvestment';
import { computed, defineComponent, PropType, ref } from 'vue';

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
        const DESCRIPTION_PREVIEW_LENGTH = 120;

        const expandedDescriptions = ref(new Set<string>());

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

        function formatGrantAmount(amountUsd: number | null): string {
            return amountUsd === null ? 'Undisclosed' : formatInvestment(amountUsd / 1_000_000);
        }

        function formatList(values: readonly string[]): string {
            return values.length > 0 ? values.join(', ') : 'Not specified';
        }

        function isDescriptionExpanded(grantId: string): boolean {
            return expandedDescriptions.value.has(grantId);
        }

        function toggleDescription(grantId: string): void {
            if (expandedDescriptions.value.has(grantId)) {
                expandedDescriptions.value.delete(grantId);
            } else {
                expandedDescriptions.value.add(grantId);
            }
        }

        function truncatedDescription(description: string | null): string {
            if (description === null) {
                return 'Not specified';
            }
            return description.length <= DESCRIPTION_PREVIEW_LENGTH
                ? description
                : `${description.slice(0, DESCRIPTION_PREVIEW_LENGTH)}…`;
        }

        function isDescriptionTruncated(description: string | null): boolean {
            return description !== null && description.length > DESCRIPTION_PREVIEW_LENGTH;
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
            isDescriptionExpanded,
            toggleDescription,
            truncatedDescription,
            isDescriptionTruncated,
            columns,
            columnLabels,
            getCellValue,
            instrumentTextColor,
        };
    },
});
</script>

<template>
    <div v-if="grants.length" class="table-wrapper">
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
                    class="grant-item"
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
                                >{{ row.instrument.label }}</span
                            >
                        </td>

                        <td v-else-if="col === 'platform'" class="platform-cell">
                            <span
                                v-for="segment in row.segments ?? []"
                                :key="segment.label"
                                class="platform-segment"
                                :class="{ 'is-active': segment.active }"
                                >{{ segment.label }}</span
                            >
                        </td>

                        <td v-else-if="col === 'funderAgencies'">
                            {{ formatList(row.grant.funderAgencies) }}
                        </td>

                        <td v-else-if="col === 'funderName'">
                            {{ row.grant.funderName ?? 'Not specified' }}
                        </td>

                        <td v-else-if="col === 'recipients'">
                            {{ row.grant.recipients ?? 'Not specified' }}
                        </td>

                        <td v-else-if="col === 'projectTitle'">
                            {{ row.grant.projectTitle ?? 'Untitled grant' }}
                        </td>

                        <td v-else-if="col === 'description'" class="description-cell">
                            <template v-if="isDescriptionExpanded(row.grant.id)">
                                {{ row.grant.description ?? 'Not specified' }}
                                <button
                                    class="description-toggle"
                                    type="button"
                                    @click="toggleDescription(row.grant.id)"
                                >
                                    Show less
                                </button>
                            </template>
                            <template v-else>
                                {{ truncatedDescription(row.grant.description) }}
                                <button
                                    v-if="isDescriptionTruncated(row.grant.description)"
                                    class="description-toggle"
                                    type="button"
                                    @click="toggleDescription(row.grant.id)"
                                >
                                    Show more
                                </button>
                            </template>
                        </td>

                        <td v-else-if="col === 'amountUsd'">
                            {{ formatGrantAmount(row.grant.amountUsd) }}
                        </td>

                        <td v-else-if="col === 'yearsDisbursed'">
                            {{ formatList(row.grant.yearsDisbursed) }}
                        </td>

                        <td v-else-if="col === 'url'" class="url-cell">
                            <a
                                v-if="row.sourceUrl"
                                class="grant-link"
                                :href="row.sourceUrl"
                                target="_blank"
                                rel="noopener noreferrer"
                                >View announcement</a
                            >
                            <span v-else class="no-url">—</span>
                        </td>

                        <td v-else>{{ row.grant[col] ?? '—' }}</td>
                    </template>
                </tr>
            </tbody>
        </table>
    </div>
</template>
<style scoped>
.table-wrapper {
    border: black 2px solid;
}

.grant-table {
    width: 100%;
    border-collapse: collapse;
    font-size: 12px;
}

.grant-table th {
    text-align: left;
    padding: 6px 8px;
    border-bottom: 1px solid var(--muted-border);
    font-weight: 600;
}

.grant-table td {
    padding: 6px 8px;
    border-bottom: 1px solid var(--muted-light);
    vertical-align: top;
}

.grant-item td:first-child {
    border-left: 4px solid;
    border-left-color: inherit;
}

.instrument-chip {
    display: inline-block;
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    white-space: nowrap;
}

.platform-segment {
    display: inline-block;
    width: 24px;
    text-align: center;
    font-size: 11px;
    font-weight: 600;
    color: var(--muted);
    border: 1px solid var(--muted-border);
    border-radius: 3px;
    margin-right: 2px;
}

.platform-segment.is-active {
    color: var(--text);
    background-color: var(--muted-bg);
}

.description-cell {
    max-width: 240px;
    word-break: break-word;
}

.description-toggle {
    margin-left: 6px;
    font-size: 11px;
    color: var(--link);
    background: none;
    border: none;
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 2px;
}

.no-url {
    color: var(--muted);
}

.grant-link,
.source-link {
    color: var(--link);
    text-decoration: underline;
    text-underline-offset: 2px;
}

.grant-link {
    display: inline-block;
    font-size: 12px;
}

.grant-link:hover,
.source-link:hover {
    opacity: 0.7;
}
</style>
