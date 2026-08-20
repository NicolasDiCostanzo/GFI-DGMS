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
    readonly LINK: string;
    readonly PANEL_SHADOW: string;
    readonly PANEL_SHADOW_STRONG: string;
    readonly MUTED_BORDER: string;
    readonly MUTED: string;
    readonly MUTED_BG: string;
    readonly MUTED_LIGHT: string;
    readonly ON_ACCENT: string;
    readonly ON_LIGHT: string;
    readonly ON_LINK: string;
    readonly PROGRESS_BG: string;
    readonly ERROR: string;
    readonly TEXT: string;
}

export const LIGHT_THEME_COLORS: ThemeColors = {
    OCEAN: '#e8f4f8',
    INACTIVE: '#cccccc',
    BORDER: '#000000',
    TOOLTIP_BG: 'rgba(0, 0, 0, 0.8)',
    TOOLTIP_TEXT: 'white',
    LEGEND_BG: 'rgba(255, 255, 255, 0.9)',
    LEGEND_TEXT: '#333333',
    SIDEBAR_BG: 'white',
    ACCENT: '#2196f3',
    LINK: '#1565c0',
    PANEL_SHADOW: 'rgba(0, 0, 0, 0.1)',
    PANEL_SHADOW_STRONG: 'rgba(0, 0, 0, 0.3)',
    MUTED_BORDER: 'rgba(128, 128, 128, 0.3)',
    MUTED: 'rgba(128, 128, 128, 0.5)',
    MUTED_BG: 'rgba(128, 128, 128, 0.15)',
    MUTED_LIGHT: 'rgba(128, 128, 128, 0.2)',
    ON_ACCENT: 'white',
    ON_LIGHT: '#000000',
    ON_LINK: 'white',
    PROGRESS_BG: '#e0e0e0',
    ERROR: '#d32f2f',
    TEXT: '#000000',
};

export const DARK_THEME_COLORS: ThemeColors = {
    OCEAN: '#1a2634',
    INACTIVE: '#555555',
    BORDER: 'white',
    TOOLTIP_BG: 'rgba(0, 0, 0, 0.9)',
    TOOLTIP_TEXT: 'white',
    LEGEND_BG: 'rgba(30, 30, 30, 0.95)',
    LEGEND_TEXT: '#e0e0e0',
    SIDEBAR_BG: '#121212',
    ACCENT: '#2196f3',
    LINK: '#64b5f6',
    PANEL_SHADOW: 'rgba(0, 0, 0, 0.1)',
    PANEL_SHADOW_STRONG: 'rgba(0, 0, 0, 0.3)',
    MUTED_BORDER: 'rgba(128, 128, 128, 0.3)',
    MUTED: 'rgba(128, 128, 128, 0.5)',
    MUTED_BG: 'rgba(128, 128, 128, 0.15)',
    MUTED_LIGHT: 'rgba(128, 128, 128, 0.2)',
    ON_ACCENT: 'white',
    ON_LIGHT: '#000000',
    ON_LINK: '#000000',
    PROGRESS_BG: '#404040',
    ERROR: '#f44336',
    TEXT: 'white',
};

export const AIM_PALETTES = {
    'Research & Development': {
        light: {
            borderColor: '#1565c0',
            backgroundColor: 'rgba(21, 101, 192, 0.25)',
            textColor: '#1565c0',
        },
        dark: {
            borderColor: '#64b5f6',
            backgroundColor: 'rgba(100, 181, 246, 0.25)',
            textColor: '#64b5f6',
        },
    },
    Commercialization: {
        light: {
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.25)',
            textColor: '#2e7d32',
        },
        dark: {
            borderColor: '#81c784',
            backgroundColor: 'rgba(129, 199, 132, 0.25)',
            textColor: '#81c784',
        },
    },
    Mixed: {
        light: {
            borderColor: '#f57f17',
            backgroundColor: 'rgba(245, 127, 23, 0.25)',
            textColor: '#f57f17',
        },
        dark: {
            borderColor: '#ffd54f',
            backgroundColor: 'rgba(255, 213, 79, 0.25)',
            textColor: '#ffd54f',
        },
    },
} as const;

export const INSTRUMENT_FAMILY_COLORS = {
    Research: { light: '#1565c0', dark: '#64b5f6' },
    Business: { light: '#2e7d32', dark: '#81c784' },
    Debt: { light: '#c62828', dark: '#ef5350' },
    Equity: { light: '#6a1b9a', dark: '#ba68c8' },
    Infrastructure: { light: '#00796b', dark: '#26a69a' },
    Other: { light: '#616161', dark: '#bdbdbd' },
} as const;

export const ENVIRONMENTAL_METRIC_COLORS = {
    ghg: '#a1662f',
    land: '#43a047',
    water: '#2196f3',
} as const;

export function getThemeColors(mode: ThemeMode): ThemeColors {
    const isDark = mode === 'dark' || mode === 'colorblind-dark';
    return isDark ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;
}
