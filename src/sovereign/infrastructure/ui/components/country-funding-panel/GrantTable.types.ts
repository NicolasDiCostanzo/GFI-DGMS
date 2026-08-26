import type { Grant } from '@/sovereign/domain/Grant';
import type { AimDisplay } from '@/sovereign/infrastructure/ui/constants/AimDisplay';
import type { FundingInstrumentDisplay } from '@/sovereign/infrastructure/ui/constants/FundingInstrumentDisplay';
import type { PlatformSegment } from '@/sovereign/infrastructure/ui/constants/ProductionPlatformSegments';

export const GRANT_TABLE_COLUMN_ORDER = [
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

export type GrantTableColumn = (typeof GRANT_TABLE_COLUMN_ORDER)[number];

const NON_SORTABLE_GRANT_TABLE_COLUMNS: ReadonlySet<GrantTableColumn> = new Set([
    'platform',
    'description',
    'url',
]);

export function isSortableGrantTableColumn(column: GrantTableColumn): boolean {
    return !NON_SORTABLE_GRANT_TABLE_COLUMNS.has(column);
}

export const GRANT_TABLE_COLUMN_LABELS: Record<GrantTableColumn, string> = {
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

export interface EnrichedGrantRow {
    readonly grant: Grant;
    readonly sourceUrl: string | null;
    readonly aim: AimDisplay | null;
    readonly instrument: FundingInstrumentDisplay;
    readonly segments: readonly PlatformSegment[] | null;
}
