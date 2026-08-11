import type { Grant } from '@/sovereign/domain/Grant';

export type ProductionPillar = 'Plant-based' | 'Cultivated';

// Airtable's Production Platform field has near-duplicate values (e.g. "Plant-based" vs
// "Plant-Based" vs "Plant-based meat") and combined values (e.g. "PB & CM" covers both
// pillars) — see AirtableJsonCountryFundingRepository for the equivalent country-name
// reconciliation. Only plant-based and cultivated have published LCA comparison figures;
// fermentation-only values are intentionally not tallied here.
const PLANT_BASED_VALUES = new Set([
    'Plant-based',
    'Plant-Based',
    'Plant-based meat',
    'PB & FM',
    'PB & CM',
]);
const CULTIVATED_VALUES = new Set(['Cultivated', 'CM & FM', 'PB & CM']);

/**
 * Determines which production pillar (plant-based or cultivated) is most represented
 * across a country's grants, so an illustrative LCA comparison can be shown for it.
 * Returns null when neither pillar has any representation, or when they're tied —
 * there is no genuinely dominant pillar to report in either case.
 */
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
