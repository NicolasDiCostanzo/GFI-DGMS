export const SHORT_GRANT = {
    id: 'rec-short',
    dateAnnounced: '2024-01-01',
    country: 'Germany',
    funderAgencies: ['BMBF'],
    funderName: 'BMBF',
    recipients: 'Short Recipient',
    projectTitle: 'Short grant',
    description: 'Short description.',
    fundingAmountUsd: 1_000_000,
    yearForAnnualFigures: '2024',
    yearsDisbursed: ['2024'],
    aim: 'Research & Development',
    fundingInstrument: 'Research Grant',
    productionPlatforms: ['Plant-based'],
    sourceUrl: null,
};

export const LONG_GRANT = {
    id: 'rec-long',
    dateAnnounced: '2024-01-01',
    country: 'Germany',
    funderAgencies: [
        'Federal Ministry of Education and Research (BMBF)',
        'German Research Foundation (DFG)',
        'Max Planck Society',
    ],
    funderName: 'A Very Long Funder Organization Name For Testing Purposes',
    recipients: 'A Very Long Recipient Organization Name For Testing Purposes',
    projectTitle:
        'A very long project title used to force this table row to wrap onto several lines',
    description:
        'A very long description used to force this table row to wrap onto many lines and grow much taller than the other row if row heights are not otherwise constrained to be uniform across the table. '.repeat(
            3,
        ),
    fundingAmountUsd: 9_000_000,
    yearForAnnualFigures: '2024',
    yearsDisbursed: ['2020', '2021', '2022', '2023', '2024'],
    aim: 'Research & Development',
    fundingInstrument: 'Research Grant',
    productionPlatforms: ['All'],
    sourceUrl: null,
};
