export function formatInvestment(amountInMillions: number): string {
    const roundedMillions = parseFloat(amountInMillions.toFixed(2));
    const isBillions = roundedMillions >= 1000;
    const value = isBillions ? amountInMillions / 1000 : amountInMillions;
    const suffix = isBillions ? 'B' : 'M';
    const formatted = parseFloat(value.toFixed(2)).toString();
    return `$${formatted}${suffix}`;
}
