import {
    MapColors,
    getFundingProgressColors,
    type ThemeMode,
} from '@/sovereign/domain/constants/MapColors';

/**
 * Buckets a country's total funding into the 5-color accessible palette using thresholds
 * computed by calculateFundingColorThresholds. Zero (no disclosed funding) gets its own
 * "no data" color rather than the lowest funding tier — those are different claims.
 */
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
