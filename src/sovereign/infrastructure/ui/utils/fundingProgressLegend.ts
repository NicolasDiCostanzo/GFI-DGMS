import { toPercentage } from '@/shared/utils/toPercentage';
import {
    FUNDING_PROGRESS_COLORS,
    FUNDING_PROGRESS_THRESHOLDS,
} from '../../../domain/constants/MapColors';

function formatFundingProgressLabel(colorIndex: number): string {
    if (colorIndex === 0) {
        return `< ${toPercentage(FUNDING_PROGRESS_THRESHOLDS[0])}%`;
    }
    if (colorIndex === FUNDING_PROGRESS_THRESHOLDS.length) {
        return `> ${toPercentage(FUNDING_PROGRESS_THRESHOLDS[colorIndex - 1])}%`;
    }
    return `${toPercentage(FUNDING_PROGRESS_THRESHOLDS[colorIndex - 1])}-${toPercentage(FUNDING_PROGRESS_THRESHOLDS[colorIndex])}%`;
}

export const LEGEND_ITEMS = FUNDING_PROGRESS_COLORS.map((color, index) => ({
    color,
    label: formatFundingProgressLabel(index),
}));
