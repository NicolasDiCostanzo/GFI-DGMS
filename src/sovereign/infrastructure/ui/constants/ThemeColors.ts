import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';

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
    readonly TEXT: string;
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
    TEXT: '#000000',
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
    TEXT: '#ffffff',
};

export function getThemeColors(mode: ThemeMode): ThemeColors {
    const isDark = mode === 'dark' || mode === 'colorblind-dark';
    return isDark ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;
}
