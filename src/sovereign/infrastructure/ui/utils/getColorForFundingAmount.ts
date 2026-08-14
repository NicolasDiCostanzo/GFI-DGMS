import {
    MapColors,
    getFundingProgressColors,
    type ThemeMode,
} from '@/sovereign/domain/constants/MapColors';

export function getColorForFundingAmount(
    amountUsd: number,
    thresholds: readonly number[],
    mode: ThemeMode = 'dark',
): string {
    if (amountUsd <= 0) {
        return MapColors.INACTIVE;
    }

    const colors = getFundingProgressColors(mode);
    const index = thresholds.findIndex((threshold) => amountUsd < threshold);
    return index === -1 ? colors[colors.length - 1] : colors[index];
}
