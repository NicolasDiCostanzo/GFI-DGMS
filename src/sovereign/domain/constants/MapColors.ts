export const MapColors = {
    RED: '#d32f2f',
    ORANGE: '#f57c00',
    YELLOW_AMBER: '#fdd835',
    GREEN: '#4caf50',
    NEON_GREEN: '#00e676',
    INACTIVE: '#cccccc',
} as const;

export type MapColor = (typeof MapColors)[keyof typeof MapColors];

export const FUNDING_PROGRESS_THRESHOLDS: readonly number[] = [0.5, 0.8, 1.0, 1.2];

export const FUNDING_PROGRESS_COLORS: readonly MapColor[] = [
    MapColors.RED,
    MapColors.ORANGE,
    MapColors.YELLOW_AMBER,
    MapColors.GREEN,
    MapColors.NEON_GREEN,
];

export function getColorForFundingProgress(fundingProgress: number): MapColor {
    const index = FUNDING_PROGRESS_THRESHOLDS.findIndex((threshold) => fundingProgress < threshold);
    return index === -1
        ? FUNDING_PROGRESS_COLORS[FUNDING_PROGRESS_COLORS.length - 1]
        : FUNDING_PROGRESS_COLORS[index];
}
