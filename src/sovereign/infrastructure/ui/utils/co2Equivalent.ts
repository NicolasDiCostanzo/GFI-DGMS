const TONNES_CO2_PER_CAR_PER_YEAR = 4.6;

export function co2TonnesToCarsEquivalent(tonnes: number): number {
    return Math.round(tonnes / TONNES_CO2_PER_CAR_PER_YEAR);
}

export function formatCarsEquivalent(cars: number): string {
    return `${cars.toLocaleString('en-US')} cars off the road`;
}
