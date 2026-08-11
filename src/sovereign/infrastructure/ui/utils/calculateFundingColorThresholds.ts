const QUANTILES: readonly number[] = [0.2, 0.4, 0.6, 0.8];

/**
 * Computes quantile breakpoints from the real per-country funding totals, so the map's
 * 5-color palette reflects the actual current distribution instead of a fixed scale —
 * funding totals span orders of magnitude and change nightly, unlike the old 0-1 ratio
 * this replaces. Totals of zero (no disclosed funding) are excluded from the distribution;
 * they get their own dedicated "no data" color instead of skewing the low end.
 */
export function calculateFundingColorThresholds(totals: readonly number[]): readonly number[] {
    const positiveTotals = totals
        .filter((total) => total > 0)
        .slice()
        .sort((a, b) => a - b);

    if (positiveTotals.length === 0) {
        return [];
    }

    return QUANTILES.map((quantile) => {
        const index = Math.min(
            positiveTotals.length - 1,
            Math.floor(positiveTotals.length * quantile),
        );
        return positiveTotals[index];
    });
}
