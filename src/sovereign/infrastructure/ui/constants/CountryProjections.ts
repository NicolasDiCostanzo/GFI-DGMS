export interface Country2040Projection {
    readonly gvaEurBillions: number;
    readonly jobs: number;
}

export const COUNTRY_2040_PROJECTIONS: Readonly<Record<string, Country2040Projection>> = {
    France: { gvaEurBillions: 18, jobs: 64_000 },
    Italy: { gvaEurBillions: 10, jobs: 31_000 },
    Spain: { gvaEurBillions: 10, jobs: 34_000 },
};
