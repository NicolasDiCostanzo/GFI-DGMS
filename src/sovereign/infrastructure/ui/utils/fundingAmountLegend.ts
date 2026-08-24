import {
    MapColors,
    getFundingProgressColors,
    type ThemeMode,
} from '@/sovereign/infrastructure/ui/constants/MapColors';
import { formatInvestment } from './formatInvestment';

export { type ThemeMode };

export interface LegendItem {
    readonly color: string;
    readonly label: string;
}

function formatBucketLabel(lower: number | undefined, upper: number | undefined): string {
    if (lower === undefined && upper === undefined) {
        return 'No data';
    }
    if (lower === undefined) {
        return `< ${formatInvestment(upper! / 1_000_000)}`;
    }
    if (upper === undefined) {
        return `>= ${formatInvestment(lower / 1_000_000)}`;
    }
    return `${formatInvestment(lower / 1_000_000)}-${formatInvestment(upper / 1_000_000)}`;
}

export function createFundingAmountLegendItems(
    thresholds: readonly number[],
    mode: ThemeMode,
): LegendItem[] {
    const colors = getFundingProgressColors(mode);
    const items: LegendItem[] = [{ color: MapColors.INACTIVE, label: 'No disclosed funding' }];

    colors.forEach((color, index) => {
        items.push({ color, label: formatBucketLabel(thresholds[index - 1], thresholds[index]) });
    });

    return items;
}
