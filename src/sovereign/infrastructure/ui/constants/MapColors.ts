import { BASE_COLORS, type ThemeMode } from './ThemePrimitives';

export type { ThemeMode };

export const MapColors = {
    ...BASE_COLORS,
    ORANGE: '#f57c00',
    YELLOW_AMBER: '#fdd835',
    GREEN: '#4caf50',
    NEON_GREEN: '#00e676',
} as const;

export const STANDARD_FUNDING_PROGRESS_COLORS = [
    MapColors.RED,
    MapColors.ORANGE,
    MapColors.YELLOW_AMBER,
    MapColors.GREEN,
    MapColors.NEON_GREEN,
] as const;

export const COLORBLIND_FUNDING_PROGRESS_COLORS = [
    '#0072B2',
    '#56B4E9',
    '#009E73',
    '#E69F00',
    '#D55E00',
] as const;

export function getFundingProgressColors(mode: ThemeMode): readonly string[] {
    return mode.startsWith('colorblind')
        ? COLORBLIND_FUNDING_PROGRESS_COLORS
        : STANDARD_FUNDING_PROGRESS_COLORS;
}
