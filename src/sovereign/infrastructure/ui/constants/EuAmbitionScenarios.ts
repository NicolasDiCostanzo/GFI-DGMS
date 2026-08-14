export interface EuAmbitionScenario {
    readonly key: 'moderate' | 'highAmbition';
    readonly label: string;
    readonly gvaEurBillions: number;
    readonly domesticMarketEurBillions: number;
    readonly exportsEurBillions: number;
    readonly jobs: number;
    readonly publicInvestmentEurBillionsPerYear: number;
}

export const EU_AMBITION_SCENARIOS: readonly EuAmbitionScenario[] = [
    {
        key: 'moderate',
        label: 'Moderate Policy Support (2040)',
        gvaEurBillions: 111,
        domesticMarketEurBillions: 53,
        exportsEurBillions: 60,
        jobs: 414_000,
        publicInvestmentEurBillionsPerYear: 1.4,
    },
    {
        key: 'highAmbition',
        label: 'High Ambition (2040)',
        gvaEurBillions: 260,
        domesticMarketEurBillions: 205,
        exportsEurBillions: 128,
        jobs: 1_000_000,
        publicInvestmentEurBillionsPerYear: 5.4,
    },
];

export const EU_MEMBER_COUNTRY_NAMES: readonly string[] = [
    'Austria',
    'Belgium',
    'Bulgaria',
    'Croatia',
    'Cyprus',
    'Czechia',
    'Denmark',
    'Estonia',
    'Finland',
    'France',
    'Germany',
    'Greece',
    'Hungary',
    'Ireland',
    'Italy',
    'Latvia',
    'Lithuania',
    'Luxembourg',
    'Malta',
    'Netherlands',
    'Poland',
    'Portugal',
    'Romania',
    'Slovakia',
    'Slovenia',
    'Spain',
    'Sweden',
];
