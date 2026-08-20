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

interface MeatTypeCase {
    readonly tabLabel: string;
    readonly ghg: string;
    readonly land: string | null;
    readonly water: string;
}

export const PLANT_BASED_MEAT_TYPE_CASES: readonly MeatTypeCase[] = [
    { tabLabel: 'Beef', ghg: '-90%', land: '-96%', water: '-87%' },
    { tabLabel: 'Pork', ghg: '-71%', land: '-41%', water: '-81%' },
    { tabLabel: 'Chicken', ghg: '-36%', land: null, water: '-72%' },
];

export function createWrapper(grants?: readonly Grant[]) {
    return mount(EnvironmentalImpactPanel, {
        props: grants === undefined ? {} : { grants },
    });
}
