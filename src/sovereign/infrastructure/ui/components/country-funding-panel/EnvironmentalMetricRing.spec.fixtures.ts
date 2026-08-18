import { ENVIRONMENTAL_METRIC_COLORS } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { mount } from '@vue/test-utils';
import EnvironmentalMetricRing from './EnvironmentalMetricRing.vue';

export interface RingCase {
    readonly name: string;
    readonly value: number | null;
    readonly label: string;
    readonly color: string;
    readonly icon?: string;
}

export const RING_CASES: readonly RingCase[] = [
    {
        name: 'GHG',
        value: 90,
        label: 'GHG Reduction',
        color: ENVIRONMENTAL_METRIC_COLORS.ghg,
        icon: '🏭',
    },
    { name: 'Land', value: 96, label: 'Land', color: ENVIRONMENTAL_METRIC_COLORS.land, icon: '🌱' },
    {
        name: 'Water',
        value: 87,
        label: 'Water',
        color: ENVIRONMENTAL_METRIC_COLORS.water,
        icon: '💧',
    },
];

export function createWrapper(props: {
    value: number | null;
    label: string;
    color: string;
    icon?: string;
}) {
    return mount(EnvironmentalMetricRing, { props });
}
