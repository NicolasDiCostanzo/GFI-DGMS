export type ThemeMode = 'light' | 'dark' | 'colorblind-light' | 'colorblind-dark';

export const MapColors = {
    RED: '#d32f2f',
    ORANGE: '#f57c00',
    YELLOW_AMBER: '#fdd835',
    GREEN: '#4caf50',
    NEON_GREEN: '#00e676',
    INACTIVE: '#cccccc',
    SELECTION: '#2196f3',
    OCEAN: '#e8f4f8',
    BORDER: '#000000',
} as const;

export const COLORBLIND_FUNDING_PROGRESS_COLORS: readonly string[] = [
    '#0072B2',
    '#56B4E9',
    '#009E73',
    '#E69F00',
    '#D55E00',
];

export function getFundingProgressColors(mode: ThemeMode): readonly string[] {
    if (mode === 'colorblind-light' || mode === 'colorblind-dark') {
        return COLORBLIND_FUNDING_PROGRESS_COLORS;
    }
    return [
        MapColors.RED,
        MapColors.ORANGE,
        MapColors.YELLOW_AMBER,
        MapColors.GREEN,
        MapColors.NEON_GREEN,
    ];
}

export function toRGB(hexColor: string): string {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
}
