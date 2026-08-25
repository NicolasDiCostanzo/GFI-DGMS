import { BASE_COLORS, isDarkTheme, toRgba, type ThemeMode } from './ThemePrimitives';

// #region Types
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
    readonly CARD_SHADOW: string;
    readonly ROW_SHADOW: string;
    readonly MODAL_OVERLAY: string;
    readonly MODAL_SHADOW: string;
    readonly PANEL_BORDER: string;
    readonly PANEL_BORDER_STRONG: string;
    readonly HIGHLIGHT: string;
    readonly HIGHLIGHT_BG: string;
    readonly HIGHLIGHT_BORDER: string;
}
// #endregion

// #region Helpers & Color Primitives
const LINK_BLUE = { light: '#1565c0', dark: '#64b5f6' } as const;
const AMBER = { light: '#f57f17', dark: '#ffd54f' } as const;
const HIGHLIGHT_BLUE = '#1c92ff';

function createAimPalette(color: { light: string; dark: string }) {
    return {
        light: {
            borderColor: color.light,
            backgroundColor: toRgba(color.light, 0.25),
            textColor: color.light,
        },
        dark: {
            borderColor: color.dark,
            backgroundColor: toRgba(color.dark, 0.25),
            textColor: color.dark,
        },
    };
}
// #endregion

// #region Base Theme Definitions
const SHARED_THEME_COLORS = {
    PANEL_SHADOW: 'rgba(0, 0, 0, 0.1)',
    PANEL_SHADOW_STRONG: 'rgba(0, 0, 0, 0.3)',
    MUTED_BORDER: 'rgba(128, 128, 128, 0.3)',
    MUTED: 'rgba(128, 128, 128, 0.5)',
    MUTED_BG: 'rgba(128, 128, 128, 0.15)',
    MUTED_LIGHT: 'rgba(128, 128, 128, 0.2)',
    CARD_SHADOW: 'rgba(127, 127, 127, 0.6)',
    ROW_SHADOW: 'rgba(127, 127, 127, 0.15)',
    MODAL_OVERLAY: 'rgba(0, 0, 0, 0.65)',
    MODAL_SHADOW: 'rgba(0, 0, 0, 0.5)',
    PANEL_BORDER: '#2a2a2a',
    PANEL_BORDER_STRONG: '#333333',
    HIGHLIGHT: HIGHLIGHT_BLUE,
    HIGHLIGHT_BG: toRgba(HIGHLIGHT_BLUE, 0.1),
    HIGHLIGHT_BORDER: toRgba(HIGHLIGHT_BLUE, 0.25),
} as const;

export const LIGHT_THEME_COLORS: ThemeColors = {
    OCEAN: BASE_COLORS.AQUA,
    INACTIVE: BASE_COLORS.GREY,
    BORDER: BASE_COLORS.BLACK,
    TOOLTIP_BG: 'rgba(0, 0, 0, 0.8)',
    TOOLTIP_TEXT: 'white',
    LEGEND_BG: 'rgba(255, 255, 255, 0.9)',
    LEGEND_TEXT: '#333333',
    SIDEBAR_BG: 'white',
    ACCENT: BASE_COLORS.BLUE,
    LINK: LINK_BLUE.light,
    ON_ACCENT: 'white',
    ON_LIGHT: '#000000',
    ON_LINK: 'white',
    PROGRESS_BG: '#e0e0e0',
    ERROR: BASE_COLORS.RED,
    TEXT: '#000000',
    ...SHARED_THEME_COLORS,
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
    ACCENT: BASE_COLORS.BLUE,
    LINK: LINK_BLUE.dark,
    ON_ACCENT: 'white',
    ON_LIGHT: '#000000',
    ON_LINK: '#000000',
    PROGRESS_BG: '#404040',
    ERROR: '#f44336',
    TEXT: 'white',
    ...SHARED_THEME_COLORS,
};
// #endregion

// #region Domain Palettes
export const INSTRUMENT_FAMILY_COLORS = {
    Research: LINK_BLUE,
    Business: { light: '#2e7d32', dark: '#81c784' },
    Debt: { light: '#c62828', dark: '#ef5350' },
    Equity: { light: '#6a1b9a', dark: '#ba68c8' },
    Infrastructure: { light: '#00796b', dark: '#26a69a' },
    Other: { light: '#616161', dark: '#bdbdbd' },
} as const;

export const AIM_PALETTES = {
    'Research & Development': createAimPalette(INSTRUMENT_FAMILY_COLORS.Research),
    Commercialization: createAimPalette(INSTRUMENT_FAMILY_COLORS.Business),
    Mixed: createAimPalette(AMBER),
} as const;

export const ENVIRONMENTAL_METRIC_COLORS = {
    ghg: '#a1662f',
    land: '#43a047',
    water: '#2196f3',
} as const;
// #endregion

// #region Theme Getters
export function getMetricGradientEndColor(color: string): string {
    return `color-mix(in srgb, ${color} 80%, black)`;
}

export function getThemeColors(mode: ThemeMode): ThemeColors {
    return isDarkTheme(mode) ? DARK_THEME_COLORS : LIGHT_THEME_COLORS;
}
// #endregion
