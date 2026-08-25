import type { Grant } from '@/sovereign/domain/Grant';
import type {
    EnrichedGrantRow,
    GrantTableColumn,
} from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTable.types';

export type SortDirection = 'asc' | 'desc';

function getLastDisbursedYear(grant: Grant): number {
    const years = grant.yearsDisbursed
        .map((year) => Number(year))
        .filter((year) => Number.isFinite(year));
    return years.length > 0 ? Math.max(...years) : 0;
}

function normalizeForSort(value: string): string {
    return value
        .replace(/^\[RETRACTED\]/, '')
        .replace(/[^a-zA-Z0-9]/g, '')
        .toLowerCase();
}

export function sortGrantRows(
    rows: readonly EnrichedGrantRow[],
    column: GrantTableColumn,
    direction: SortDirection,
    getCellValue: (column: GrantTableColumn, row: EnrichedGrantRow) => string,
): EnrichedGrantRow[] {
    return [...rows].sort((a, b) => {
        if (column === 'yearsDisbursed') {
            const diff = getLastDisbursedYear(a.grant) - getLastDisbursedYear(b.grant);
            return direction === 'asc' ? diff : -diff;
        }
        if (column === 'amountUsd') {
            const diff = (a.grant.amountUsd ?? 0) - (b.grant.amountUsd ?? 0);
            return direction === 'asc' ? diff : -diff;
        }
        const aNorm = normalizeForSort(getCellValue(column, a));
        const bNorm = normalizeForSort(getCellValue(column, b));
        return direction === 'asc' ? aNorm.localeCompare(bNorm) : bNorm.localeCompare(aNorm);
    });
}
