import { BASE_COLORS, type ThemeMode } from './ThemePrimitives';

export const TO_RGB_CASES: ReadonlyArray<[hex: string, expectedRgb: string]> = [
    [BASE_COLORS.RED, 'rgb(211, 47, 47)'],
    [BASE_COLORS.GREY, 'rgb(204, 204, 204)'],
    [BASE_COLORS.BLUE, 'rgb(33, 150, 243)'],
    [BASE_COLORS.AQUA, 'rgb(232, 244, 248)'],
    [BASE_COLORS.BLACK, 'rgb(0, 0, 0)'],
];

export const TO_RGBA_CASES: ReadonlyArray<[hex: string, alpha: number, expected: string]> = [
    ['#1c92ff', 0.25, 'rgba(28, 146, 255, 0.25)'],
    [BASE_COLORS.BLUE, 0.5, 'rgba(33, 150, 243, 0.5)'],
    [BASE_COLORS.RED, 1, 'rgba(211, 47, 47, 1)'],
];

export const IS_DARK_THEME_CASES: ReadonlyArray<[mode: ThemeMode, expected: boolean]> = [
    ['light', false],
    ['dark', true],
    ['colorblind-light', false],
    ['colorblind-dark', true],
];
