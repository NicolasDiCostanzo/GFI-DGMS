import {
    PRODUCTION_PLATFORM_KEYS,
    type ProductionPlatformKey,
} from '@/sovereign/domain/constants/ProductionPlatformTaxonomy';

export interface PlatformSegment {
    readonly label: 'Plant-based' | 'Cultivated' | 'Fermentation';
    readonly active: boolean;
}

const SEGMENTS: readonly {
    readonly key: ProductionPlatformKey;
    readonly label: 'Plant-based' | 'Cultivated' | 'Fermentation';
}[] = [
    { key: 'PB', label: 'Plant-based' },
    { key: 'CM', label: 'Cultivated' },
    { key: 'FM', label: 'Fermentation' },
];

export function getPlatformSegments(
    platforms: readonly string[],
): readonly PlatformSegment[] | null {
    if (platforms.length === 0) {
        return null;
    }
    const present = new Set<ProductionPlatformKey>();
    for (const platform of platforms) {
        const keys = PRODUCTION_PLATFORM_KEYS[platform];
        if (!keys) {
            continue;
        }
        for (const key of keys) {
            present.add(key);
        }
    }
    if (present.size === 0) {
        return null;
    }
    return SEGMENTS.filter((segment) => present.has(segment.key)).map((segment) => ({
        label: segment.label,
        active: true,
    }));
}
