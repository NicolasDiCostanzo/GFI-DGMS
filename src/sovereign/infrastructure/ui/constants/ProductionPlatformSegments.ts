export interface PlatformSegment {
    readonly label: 'Plant-based' | 'Cultivated' | 'Fermentation';
    readonly active: boolean;
}

type PlatformKey = 'PB' | 'CM' | 'FM';

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

const SEGMENTS: readonly {
    readonly key: PlatformKey;
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
    const present = new Set<PlatformKey>();
    for (const platform of platforms) {
        const keys = PLATFORM_VALUES[platform];
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
