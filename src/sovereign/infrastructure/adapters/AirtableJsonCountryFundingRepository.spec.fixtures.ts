import type { GrantRecord } from './AirtableJsonCountryFundingRepository';

export const BASE_RECORD: GrantRecord = {
    id: 'rec1',
    dateAnnounced: '2024-03-15',
    country: 'France',
    funderAgencies: ['Bpifrance'],
    funderName: 'Bpifrance',
    recipients: 'Gourmey',
    projectTitle: 'Scaling cultivated foie gras production',
    description: 'Funding to scale up bioreactor capacity.',
    fundingAmountUsd: 5_000_000,
    yearForAnnualFigures: '2024',
    yearsDisbursed: ['2024'],
    aim: 'Commercialization',
    fundingInstrument: 'Business Grant',
    productionPlatforms: ['Cultivated'],
    sourceUrl: 'https://example.com/1',
};

export function buildRecord(overrides: Partial<GrantRecord>): GrantRecord {
    return { ...BASE_RECORD, ...overrides };
}
