export type ProductionPlatformKey = 'PB' | 'CM' | 'FM';

export const PRODUCTION_PLATFORM_KEYS: Readonly<Record<string, readonly ProductionPlatformKey[]>> =
    {
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
