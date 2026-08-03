export function formatInvestment(amountInMillions: number): string {
    if (amountInMillions >= 1000) {
        const billions = amountInMillions / 1000;
        const formatted = billions % 1 === 0 ? billions.toString() : billions.toFixed(1);
        return `$${formatted}B`;
    }
    return `$${amountInMillions}M`;
}
