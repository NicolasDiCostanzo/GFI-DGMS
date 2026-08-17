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

export function createWrapper(props: {
    title: string;
    figures: readonly KpiFigure[];
    variant?: string;
}) {
    return mount(KpiCard, { props });
}
