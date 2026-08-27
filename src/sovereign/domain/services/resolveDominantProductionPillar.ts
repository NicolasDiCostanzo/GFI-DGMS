import { Grant } from '@/sovereign/domain/Grant';
import { PRODUCTION_PLATFORM_KEYS } from '@/sovereign/domain/constants/ProductionPlatformTaxonomy';

export type ProductionPillar = 'Plant-based' | 'Cultivated';

export function resolveDominantProductionPillar(grants: readonly Grant[]): ProductionPillar | null {
    let plantBasedCount = 0;
    let cultivatedCount = 0;

    for (const grant of grants) {
        for (const platform of grant.productionPlatforms) {
            const keys = PRODUCTION_PLATFORM_KEYS[platform];
            if (!keys) continue;
            if (keys.includes('PB')) plantBasedCount += 1;
            if (keys.includes('CM')) cultivatedCount += 1;
        }
    }

    if (plantBasedCount === cultivatedCount) return null;
    return plantBasedCount > cultivatedCount ? 'Plant-based' : 'Cultivated';
}
