import type { LegendItem } from '@/sovereign/infrastructure/ui/utils/fundingAmountLegend';

export const LEGEND_ITEMS: readonly LegendItem[] = [
    { color: '#cccccc', label: 'No disclosed funding' },
    { color: '#e5f5e0', label: '< $1m' },
    { color: '#a1d99b', label: '$1m-5m' },
    { color: '#31a354', label: '>= $5m' },
];
