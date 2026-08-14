import type { Grant } from '@/sovereign/domain/Grant';

export type ProductionPillar = 'Plant-based' | 'Cultivated';

const PLANT_BASED_VALUES = new Set([
    'Plant-based',
    'Plant-Based',
    'Plant-based meat',
    'PB & FM',
    'PB & CM',
]);
const CULTIVATED_VALUES = new Set(['Cultivated', 'CM & FM', 'PB & CM']);

export function resolveDominantProductionPillar(grants: readonly Grant[]): ProductionPillar | null {
    let plantBasedCount = 0;
    let cultivatedCount = 0;

    for (const grant of grants) {
        for (const platform of grant.productionPlatforms) {
            if (PLANT_BASED_VALUES.has(platform)) plantBasedCount += 1;
            if (CULTIVATED_VALUES.has(platform)) cultivatedCount += 1;
        }
    }

    if (plantBasedCount === cultivatedCount) return null;
    return plantBasedCount > cultivatedCount ? 'Plant-based' : 'Cultivated';
}
