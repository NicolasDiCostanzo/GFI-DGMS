import { COLORBLIND_FUNDING_PROGRESS_COLORS, MapColors } from './MapColors';
import type { ThemeMode } from './ThemePrimitives';

const STANDARD_PALETTE: readonly string[] = [
    MapColors.RED,
    MapColors.ORANGE,
    MapColors.YELLOW_AMBER,
    MapColors.GREEN,
    MapColors.NEON_GREEN,
];

export const FUNDING_PROGRESS_COLORS_CASES: ReadonlyArray<
    [mode: ThemeMode, expected: readonly string[]]
> = [
    ['light', STANDARD_PALETTE],
    ['colorblind-light', COLORBLIND_FUNDING_PROGRESS_COLORS],
    ['colorblind-dark', COLORBLIND_FUNDING_PROGRESS_COLORS],
];
