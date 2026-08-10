import { type ThemeMode } from '../utils/fundingProgressLegend';

export const ICON_CASES: ReadonlyArray<
    [title: string, modelValue: ThemeMode, expectedSubstrings: readonly string[]]
> = [
    ['renders sun icon for light theme', 'light', ['circle', 'line']],
    ['renders moon icon for dark theme', 'dark', ['path']],
    ['renders eye icon for colorblind-light theme', 'colorblind-light', ['path', 'circle']],
    ['renders eye-off icon for colorblind-dark theme', 'colorblind-dark', ['path', 'line']],
];
