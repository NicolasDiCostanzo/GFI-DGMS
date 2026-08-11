export const FULL_RAW_RECORD = {
    id: 'recABC123',
    fields: {
        'Date announced': '2024-03-15',
        'Country/Multinational': 'France',
        'Funder Agency': ['Bpifrance', 'European Commission'],
        'Funder Name': 'Bpifrance and the European Commission',
        'Recipient(s)': 'Gourmey',
        'Project Title': 'Scaling cultivated foie gras production',
        'Project description': 'Funding to scale up bioreactor capacity.',
        'Funding Estimate (USD)': '$5,000,000',
        'Year for Annual Figures': '2024',
        'Years disbursed': ['2024', '2025'],
        Aim: 'Commercialization',
        'Funding Instrument': 'Business Grant',
        'Production Platform': ['Cultivated'],
        URL: 'https://example.com/announcement',
    },
};

export const EXPECTED_FROM_FULL_RECORD = {
    id: 'recABC123',
    dateAnnounced: '2024-03-15',
    country: 'France',
    funderAgencies: ['Bpifrance', 'European Commission'],
    funderName: 'Bpifrance and the European Commission',
    recipients: 'Gourmey',
    projectTitle: 'Scaling cultivated foie gras production',
    description: 'Funding to scale up bioreactor capacity.',
    fundingAmountUsd: 5_000_000,
    yearForAnnualFigures: '2024',
    yearsDisbursed: ['2024', '2025'],
    aim: 'Commercialization',
    fundingInstrument: 'Business Grant',
    productionPlatforms: ['Cultivated'],
    sourceUrl: 'https://example.com/announcement',
};

export const MINIMAL_RAW_RECORD = {
    id: 'recXYZ789',
    fields: {
        'Country/Multinational': 'Germany',
        'Project Title': 'Untitled early-stage grant',
    },
};

export const EXPECTED_FROM_MINIMAL_RECORD = {
    id: 'recXYZ789',
    dateAnnounced: null,
    country: 'Germany',
    funderAgencies: [],
    funderName: null,
    recipients: null,
    projectTitle: 'Untitled early-stage grant',
    description: null,
    fundingAmountUsd: null,
    yearForAnnualFigures: null,
    yearsDisbursed: [],
    aim: null,
    fundingInstrument: null,
    productionPlatforms: [],
    sourceUrl: null,
};
