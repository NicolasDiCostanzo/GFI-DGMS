import {
    COLORBLIND_FUNDING_PROGRESS_COLORS,
    MapColors,
} from '@/sovereign/infrastructure/ui/constants/MapColors';
import { describe, expect, it } from 'vitest';
import { createFundingAmountLegendItems } from './fundingAmountLegend';

describe('createFundingAmountLegendItems', () => {
    it('leads with a "no disclosed funding" item', () => {
        const items = createFundingAmountLegendItems([2, 4, 6, 8], 'dark');

        expect(items[0]).toEqual({ color: MapColors.INACTIVE, label: 'No disclosed funding' });
    });

    it('formats the 5 funding buckets from the thresholds', () => {
        const items = createFundingAmountLegendItems(
            [2_000_000, 4_000_000, 6_000_000, 8_000_000],
            'dark',
        );

        expect(items.slice(1).map((item) => item.label)).toEqual([
            '< $2M',
            '$2M-$4M',
            '$4M-$6M',
            '$6M-$8M',
            '>= $8M',
        ]);
    });

    it('shows "No data" for every bucket when there are no thresholds', () => {
        const items = createFundingAmountLegendItems([], 'dark');

        expect(items.slice(1).every((item) => item.label === 'No data')).toBe(true);
    });

    it('uses the colorblind-safe palette for colorblind modes', () => {
        const items = createFundingAmountLegendItems([2, 4, 6, 8], 'colorblind-dark');

        expect(items[1].color).toBe(COLORBLIND_FUNDING_PROGRESS_COLORS[0]);
    });
});
