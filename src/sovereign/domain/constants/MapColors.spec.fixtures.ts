import { COLORBLIND_FUNDING_PROGRESS_COLORS, MapColors, type ThemeMode } from './MapColors';

const STANDARD_PALETTE: readonly string[] = [
    MapColors.RED,
    MapColors.ORANGE,
    MapColors.YELLOW_AMBER,
    MapColors.GREEN,
    MapColors.NEON_GREEN,
];

export const TO_RGB_CASES: ReadonlyArray<[hex: string, expectedRgb: string]> = [
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
    [mode: ThemeMode, expected: readonly string[]]
> = [
    ['light', STANDARD_PALETTE],
    ['colorblind-light', COLORBLIND_FUNDING_PROGRESS_COLORS],
    ['colorblind-dark', COLORBLIND_FUNDING_PROGRESS_COLORS],
];
