import type {
    EnrichedGrantRow,
    GrantTableColumn,
} from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTable.types';
import {
    makeEnrichedRow,
    makeGrantFor,
} from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTableRow.spec.fixtures';
import { describe, expect, it } from 'vitest';
import { sortGrantRows } from './sortGrantRows';

const getProjectTitle = (_column: GrantTableColumn, row: EnrichedGrantRow): string =>
    row.grant.projectTitle ?? 'Not specified';

describe('sortGrantRows', () => {
    it('sorts by a normalized string column, ignoring case and punctuation', () => {
        const rowA = makeEnrichedRow({ grant: makeGrantFor({ projectTitle: 'Banana project' }) });
        const rowB = makeEnrichedRow({ grant: makeGrantFor({ projectTitle: 'apple project' }) });

        const sorted = sortGrantRows([rowA, rowB], 'projectTitle', 'asc', getProjectTitle);

        expect(sorted.map((row) => row.grant.projectTitle)).toEqual([
            'apple project',
            'Banana project',
        ]);
    });

    it('strips a leading "[RETRACTED]" marker before comparing', () => {
        const retracted = makeEnrichedRow({
            grant: makeGrantFor({ projectTitle: '[RETRACTED] Apple project' }),
        });
        const banana = makeEnrichedRow({ grant: makeGrantFor({ projectTitle: 'Banana project' }) });

        const sorted = sortGrantRows([banana, retracted], 'projectTitle', 'asc', getProjectTitle);

        expect(sorted.map((row) => row.grant.projectTitle)).toEqual([
            '[RETRACTED] Apple project',
            'Banana project',
        ]);
    });

    it('sorts by amountUsd using the raw numeric value, treating a null amount as zero', () => {
        const disclosed = makeEnrichedRow({ grant: makeGrantFor({ amountUsd: 5_000_000 }) });
        const undisclosed = makeEnrichedRow({ grant: makeGrantFor({ amountUsd: null }) });

        const sorted = sortGrantRows([disclosed, undisclosed], 'amountUsd', 'asc', () => 'unused');

        expect(sorted).toEqual([undisclosed, disclosed]);
    });

    it('sorts by yearsDisbursed using the most recent disbursement year', () => {
        const earlier = makeEnrichedRow({ grant: makeGrantFor({ yearsDisbursed: ['2021'] }) });
        const later = makeEnrichedRow({
            grant: makeGrantFor({ yearsDisbursed: ['2022', '2023'] }),
        });

        const sorted = sortGrantRows([later, earlier], 'yearsDisbursed', 'asc', () => 'unused');

        expect(sorted).toEqual([earlier, later]);
    });

    it('reverses yearsDisbursed sorting when descending', () => {
        const earlier = makeEnrichedRow({ grant: makeGrantFor({ yearsDisbursed: ['2021'] }) });
        const later = makeEnrichedRow({
            grant: makeGrantFor({ yearsDisbursed: ['2022', '2023'] }),
        });

        const sorted = sortGrantRows([earlier, later], 'yearsDisbursed', 'desc', () => 'unused');

        expect(sorted).toEqual([later, earlier]);
    });

    it('treats empty disbursement year lists as zero when sorting', () => {
        const empty = makeEnrichedRow({ grant: makeGrantFor({ yearsDisbursed: [] }) });
        const later = makeEnrichedRow({ grant: makeGrantFor({ yearsDisbursed: ['2023'] }) });

        const sorted = sortGrantRows([later, empty], 'yearsDisbursed', 'asc', () => 'unused');

        expect(sorted).toEqual([empty, later]);
    });

    it('reverses the order for the desc direction', () => {
        const disclosed = makeEnrichedRow({ grant: makeGrantFor({ amountUsd: 5_000_000 }) });
        const undisclosed = makeEnrichedRow({ grant: makeGrantFor({ amountUsd: null }) });

        const sorted = sortGrantRows([undisclosed, disclosed], 'amountUsd', 'desc', () => 'unused');

        expect(sorted).toEqual([disclosed, undisclosed]);
    });

    it('reverses normalized string ordering when descending', () => {
        const banana = makeEnrichedRow({ grant: makeGrantFor({ projectTitle: 'Banana project' }) });
        const apple = makeEnrichedRow({ grant: makeGrantFor({ projectTitle: 'apple project' }) });

        const sorted = sortGrantRows([banana, apple], 'projectTitle', 'desc', getProjectTitle);

        expect(sorted.map((row) => row.grant.projectTitle)).toEqual([
            'Banana project',
            'apple project',
        ]);
    });
});
