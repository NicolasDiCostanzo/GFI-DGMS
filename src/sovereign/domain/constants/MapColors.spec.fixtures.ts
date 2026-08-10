import {
    COLORBLIND_FUNDING_PROGRESS_COLORS,
    MapColors,
    type MapColor,
    type ThemeMode,
} from './MapColors';

export const THEME_MODES: readonly ThemeMode[] = [
    'light',
    'dark',
    'colorblind-light',
    'colorblind-dark',
];

const STANDARD_PALETTE: readonly MapColor[] = [
    MapColors.RED,
    MapColors.ORANGE,
    MapColors.YELLOW_AMBER,
    MapColors.GREEN,
    MapColors.NEON_GREEN,
];

export const FUNDING_PROGRESS_COLOR_CASES: ReadonlyArray<
    [title: string, fundingProgress: number, expected: MapColor]
> = [
    ['returns RED when fundingProgress is 0', 0, MapColors.RED],
    ['returns RED when fundingProgress is 0.25', 0.25, MapColors.RED],
    ['returns RED when fundingProgress is 0.49 (just below 0.5)', 0.49, MapColors.RED],
    ['returns ORANGE when fundingProgress is exactly 0.5', 0.5, MapColors.ORANGE],
    ['returns ORANGE when fundingProgress is 0.6', 0.6, MapColors.ORANGE],
    ['returns ORANGE when fundingProgress is 0.79 (just below 0.8)', 0.79, MapColors.ORANGE],
    ['returns YELLOW_AMBER when fundingProgress is exactly 0.8', 0.8, MapColors.YELLOW_AMBER],
    ['returns YELLOW_AMBER when fundingProgress is 0.9', 0.9, MapColors.YELLOW_AMBER],
    [
        'returns YELLOW_AMBER when fundingProgress is 0.99 (just below 1.0)',
        0.99,
        MapColors.YELLOW_AMBER,
    ],
    ['returns GREEN when fundingProgress is exactly 1.0', 1.0, MapColors.GREEN],
    ['returns GREEN when fundingProgress is 1.1', 1.1, MapColors.GREEN],
    ['returns GREEN when fundingProgress is 1.19 (just below 1.2)', 1.19, MapColors.GREEN],
    ['returns NEON_GREEN when fundingProgress is exactly 1.2', 1.2, MapColors.NEON_GREEN],
    ['returns NEON_GREEN when fundingProgress exceeds 1.2 (e.g. 2.0)', 2.0, MapColors.NEON_GREEN],
];

export const TO_RGB_CASES: ReadonlyArray<[hex: MapColor, expectedRgb: string]> = [
    [MapColors.RED, 'rgb(211, 47, 47)'],
    [MapColors.ORANGE, 'rgb(245, 124, 0)'],
    [MapColors.YELLOW_AMBER, 'rgb(253, 216, 53)'],
    [MapColors.GREEN, 'rgb(76, 175, 80)'],
    [MapColors.NEON_GREEN, 'rgb(0, 230, 118)'],
    [MapColors.INACTIVE, 'rgb(204, 204, 204)'],
    [MapColors.SELECTION, 'rgb(33, 150, 243)'],
    [MapColors.OCEAN, 'rgb(232, 244, 248)'],
    [MapColors.BORDER, 'rgb(0, 0, 0)'],
];

export const FUNDING_PROGRESS_COLORS_CASES: ReadonlyArray<
    [mode: ThemeMode, expected: readonly MapColor[]]
> = [
    ['light', STANDARD_PALETTE],
    ['dark', STANDARD_PALETTE],
    ['colorblind-light', COLORBLIND_FUNDING_PROGRESS_COLORS],
    ['colorblind-dark', COLORBLIND_FUNDING_PROGRESS_COLORS],
];

export const FUNDING_PROGRESS_MODE_CASES: ReadonlyArray<[mode: ThemeMode, expected: MapColor]> = [
    ['light', MapColors.ORANGE],
    ['dark', MapColors.ORANGE],
    ['colorblind-light', COLORBLIND_FUNDING_PROGRESS_COLORS[1]],
    ['colorblind-dark', COLORBLIND_FUNDING_PROGRESS_COLORS[1]],
];
