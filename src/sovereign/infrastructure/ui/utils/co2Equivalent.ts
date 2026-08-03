const TONNES_CO2_PER_CAR_PER_YEAR = 4.6;

export function co2TonnesToCarsEquivalent(tonnes: number): number {
    return Math.round(tonnes / TONNES_CO2_PER_CAR_PER_YEAR);
}

export function formatCarsEquivalent(cars: number): string {
    if (cars === 0) return '';
    const roadState = cars > 0 ? 'off the road' : 'on the road';
    return `${Math.abs(cars)} cars ${roadState}`;
}
