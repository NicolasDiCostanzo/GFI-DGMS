export interface PlatformSegment {
    readonly label: 'PB' | 'CM' | 'FM';
    readonly active: boolean;
}

type PlatformKey = 'PB' | 'CM' | 'FM';

// Every platform value in the tracker is a subset of three pillars: Plant-based (PB),
// Cultivated (CM), Fermentation (FM). The displayed segments keep the same order in all
// cells so a country's row reads consistently across the table.
const PLATFORM_VALUES: Readonly<Record<string, readonly PlatformKey[]>> = {
    'Plant-based': ['PB'],
    'Plant-Based': ['PB'],
    'Plant-based meat': ['PB'],
    'PB & FM': ['PB', 'FM'],
    'PB & CM': ['PB', 'CM'],
    Cultivated: ['CM'],
    'CM & FM': ['CM', 'FM'],
    Fermentation: ['FM'],
    All: ['PB', 'CM', 'FM'],
};

const SEGMENTS: readonly { readonly key: PlatformKey; readonly label: 'PB' | 'CM' | 'FM' }[] = [
    { key: 'PB', label: 'PB' },
    { key: 'CM', label: 'CM' },
    { key: 'FM', label: 'FM' },
];

export function getPlatformSegments(
    platforms: readonly string[],
): readonly PlatformSegment[] | null {
    if (platforms.length === 0) {
        return null;
    }
    const present = new Set<PlatformKey>();
    for (const platform of platforms) {
        const keys = PLATFORM_VALUES.get(platform);
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
    return SEGMENTS.map((segment) => ({
        label: segment.label,
        active: present.has(segment.key),
    }));
}
