export const MapColors = {
    RED: '#d32f2f',
    ORANGE: '#f57c00',
    YELLOW_AMBER: '#fdd835',
    GREEN: '#4caf50',
    NEON_GREEN: '#00e676',
} as const;

export type MapColor = (typeof MapColors)[keyof typeof MapColors];

export function getColorForFundingProgress(fundingProgress: number): MapColor {
    if (fundingProgress < 0.5) {
        return MapColors.RED;
    }
    if (fundingProgress < 0.8) {
        return MapColors.ORANGE;
    }
    if (fundingProgress < 1.0) {
        return MapColors.YELLOW_AMBER;
    }
    if (fundingProgress < 1.2) {
        return MapColors.GREEN;
    }
    return MapColors.NEON_GREEN;
}
