import { mount } from '@vue/test-utils';
import KpiCard from './KpiCard.vue';

export const GHG_FIGURES = [
    { label: 'Beef', value: 90 },
    { label: 'Pork', value: 71 },
    { label: 'Chicken', value: 36 },
];

export const LAND_FIGURES = [
    { label: 'Beef', value: 96 },
    { label: 'Pork', value: 41 },
    { label: 'Chicken', value: null },
];

export const WATER_FIGURES = [
    { label: 'Beef', value: 87 },
    { label: 'Pork', value: 81 },
    { label: 'Chicken', value: 72 },
];

interface KpiFigure {
    readonly label: string;
    readonly value: number | null;
}

export interface KpiCardCase {
    readonly title: string;
    readonly figures: readonly KpiFigure[];
    readonly count: number;
    readonly expected: readonly string[];
    readonly omitted: string | null;
}

export const KPI_CASES: readonly KpiCardCase[] = [
    {
        title: 'GHG Reduction',
        figures: GHG_FIGURES,
        count: 3,
        expected: ['-90% (Beef)', '-71% (Pork)', '-36% (Chicken)'],
        omitted: null,
    },
    {
        title: 'Land Saved',
        figures: LAND_FIGURES,
        count: 2,
        expected: ['-96% (Beef)', '-41% (Pork)'],
        omitted: 'Chicken',
    },
    {
        title: 'Water Saved',
        figures: WATER_FIGURES,
        count: 3,
        expected: [],
        omitted: null,
    },
];

export function createWrapper(props: {
    title: string;
    figures: readonly KpiFigure[];
    variant?: string;
}) {
    return mount(KpiCard, { props });
}
