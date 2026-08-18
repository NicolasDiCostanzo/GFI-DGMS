import { Grant, GrantId } from '@/sovereign/domain/Grant';
import { mount } from '@vue/test-utils';
import EnvironmentalImpactPanel from './EnvironmentalImpactPanel.vue';

function buildGrantWithPlatforms(productionPlatforms: string[]): Grant {
    return new Grant(
        GrantId('rec1'),
        'France',
        'Untitled grant',
        null,
        [],
        null,
        null,
        null,
        null,
        null,
        productionPlatforms,
        [],
        null,
    );
}

export const PLANT_BASED_DOMINANT_GRANTS = [
    buildGrantWithPlatforms(['Plant-based']),
    buildGrantWithPlatforms(['Plant-based']),
    buildGrantWithPlatforms(['Cultivated']),
];

export const CULTIVATED_DOMINANT_GRANTS = [
    buildGrantWithPlatforms(['Cultivated']),
    buildGrantWithPlatforms(['Cultivated']),
    buildGrantWithPlatforms(['Plant-based']),
];

export const TIED_GRANTS = [
    buildGrantWithPlatforms(['Plant-based']),
    buildGrantWithPlatforms(['Cultivated']),
];

interface PlantBasedKpiCase {
    readonly selector: string;
    readonly expected: readonly string[];
    readonly omitted: string | null;
}

export const PLANT_BASED_KPI_CASES: readonly PlantBasedKpiCase[] = [
    {
        selector: '.kpi-card--ghg',
        expected: ['-90% (beef)', '-71% (pork)', '-36% (chicken)'],
        omitted: null,
    },
    {
        selector: '.kpi-card--land',
        expected: ['-96% (beef)', '-41% (pork)'],
        omitted: 'chicken',
    },
    {
        selector: '.kpi-card--water',
        expected: ['-87% (beef)', '-81% (pork)', '-72% (chicken)'],
        omitted: null,
    },
];

export function createWrapper(grants?: readonly Grant[]) {
    return mount(EnvironmentalImpactPanel, {
        props: grants === undefined ? {} : { grants },
    });
}
