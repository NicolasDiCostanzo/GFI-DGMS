import { toPercentage } from '@/shared/utils/toPercentage';
import {
    FUNDING_PROGRESS_THRESHOLDS,
    getFundingProgressColors,
    type ThemeMode,
} from '../../../domain/constants/MapColors';

export { type ThemeMode };

function formatFundingProgressLabel(colorIndex: number): string {
    if (colorIndex === 0) {
        return `< ${toPercentage(FUNDING_PROGRESS_THRESHOLDS[0])}%`;
    }
    if (colorIndex === FUNDING_PROGRESS_THRESHOLDS.length) {
        return `>= ${toPercentage(FUNDING_PROGRESS_THRESHOLDS[colorIndex - 1])}%`;
    }
    return `${toPercentage(FUNDING_PROGRESS_THRESHOLDS[colorIndex - 1])}-${toPercentage(FUNDING_PROGRESS_THRESHOLDS[colorIndex])}%`;
}

export function createLegendItems(mode: ThemeMode) {
    const colors = getFundingProgressColors(mode);
    return colors.map((color, index) => ({
        color,
        label: formatFundingProgressLabel(index),
    }));
}
