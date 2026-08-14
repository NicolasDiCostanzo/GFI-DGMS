const QUANTILES: readonly number[] = [0.2, 0.4, 0.6, 0.8];

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
