import { mount } from '@vue/test-utils';
import EnvironmentalImpactPanel from './EnvironmentalImpactPanel.vue';

interface MeatTypeCase {
    readonly tabLabel: string;
    readonly ghg: string;
    readonly land: string | null;
    readonly water: string | null;
}

export const PLANT_BASED_MEAT_TYPE_CASES: readonly MeatTypeCase[] = [
    { tabLabel: 'Beef', ghg: '-90%', land: '-96%', water: '-87%' },
    { tabLabel: 'Pork', ghg: '-71%', land: '-41%', water: '-81%' },
    { tabLabel: 'Chicken', ghg: '-36%', land: null, water: '-72%' },
];

export const CULTIVATED_MEAT_TYPE_CASES: readonly MeatTypeCase[] = [
    { tabLabel: 'Beef', ghg: '-98%', land: '-94%', water: '-84%' },
    { tabLabel: 'Pork', ghg: '-80%', land: '-70%', water: null },
    { tabLabel: 'Chicken', ghg: '-75%', land: '-61%', water: null },
];

export function createWrapper() {
    return mount(EnvironmentalImpactPanel);
}
