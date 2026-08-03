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

export type MapColor = string;

export const FUNDING_PROGRESS_THRESHOLDS: readonly number[] = [0.5, 0.8, 1.0, 1.2];

// Okabe-Ito colorblind-safe palette: blue -> sky blue -> bluish green -> orange -> vermillion
export const COLORBLIND_FUNDING_PROGRESS_COLORS: readonly MapColor[] = [
    '#0072B2',
    '#56B4E9',
    '#009E73',
    '#E69F00',
    '#D55E00',
];

export interface ThemeColors {
    readonly OCEAN: string;
    readonly INACTIVE: string;
    readonly BORDER: string;
    readonly TOOLTIP_BG: string;
    readonly TOOLTIP_TEXT: string;
    readonly LEGEND_BG: string;
    readonly LEGEND_TEXT: string;
    readonly SIDEBAR_BG: string;
    readonly ACCENT: string;
    readonly PROGRESS_BG: string;
    readonly ERROR: string;
}

export const LIGHT_THEME_COLORS: ThemeColors = {
    OCEAN: '#e8f4f8',
    INACTIVE: '#cccccc',
    BORDER: '#000000',
    TOOLTIP_BG: 'rgba(0, 0, 0, 0.8)',
    TOOLTIP_TEXT: '#ffffff',
    LEGEND_BG: 'rgba(255, 255, 255, 0.9)',
    LEGEND_TEXT: '#333333',
    SIDEBAR_BG: 'rgba(255, 255, 255, 0.95)',
    ACCENT: '#2196f3',
    PROGRESS_BG: '#e0e0e0',
    ERROR: '#d32f2f',
};

export const DARK_THEME_COLORS: ThemeColors = {
    OCEAN: '#1a2634',
    INACTIVE: '#555555',
    BORDER: '#ffffff',
    TOOLTIP_BG: 'rgba(0, 0, 0, 0.9)',
    TOOLTIP_TEXT: '#ffffff',
    LEGEND_BG: 'rgba(30, 30, 30, 0.95)',
    LEGEND_TEXT: '#e0e0e0',
    SIDEBAR_BG: 'rgba(30, 30, 30, 0.95)',
    ACCENT: '#2196f3',
    PROGRESS_BG: '#404040',
    ERROR: '#f44336',
};

export function getThemeColors(mode: ThemeMode): ThemeColors {
    const isDark = mode === 'dark' || mode === 'colorblind-dark';
    const baseColors = isDark ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;
    return baseColors;
}

export function getFundingProgressColors(mode: ThemeMode): readonly MapColor[] {
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

export function getColorForFundingProgress(
    fundingProgress: number,
    mode: ThemeMode = 'dark',
): MapColor {
    const colors = getFundingProgressColors(mode);
    const index = FUNDING_PROGRESS_THRESHOLDS.findIndex((threshold) => fundingProgress < threshold);
    return index === -1 ? colors[colors.length - 1] : colors[index];
}

export function toRGB(hexColor: MapColor): string {
    const r = parseInt(hexColor.slice(1, 3), 16);
    const g = parseInt(hexColor.slice(3, 5), 16);
    const b = parseInt(hexColor.slice(5, 7), 16);
    return `rgb(${r}, ${g}, ${b})`;
}
