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

export function createWrapper(grants?: readonly Grant[]) {
    return mount(EnvironmentalImpactPanel, {
        props: grants === undefined ? {} : { grants },
    });
}
