import { parseFundingEstimate } from './parseFundingEstimate.mjs';

export function normalizeGrantRecord(record) {
    const fields = record.fields ?? {};

    return {
        id: record.id,
        dateAnnounced: fields['Date announced'] ?? null,
        country: fields['Country/Multinational'] ?? null,
        funderAgencies: fields['Funder Agency'] ?? [],
        funderName: fields['Funder Name'] ?? null,
        recipients: fields['Recipient(s)'] ?? null,
        projectTitle: fields['Project Title'] ?? null,
        description: fields['Project description'] ?? null,
        fundingAmountUsd: parseFundingEstimate(fields['Funding Estimate (USD)'] ?? null),
        yearForAnnualFigures: fields['Year for Annual Figures'] ?? null,
        yearsDisbursed: fields['Years disbursed'] ?? [],
        aim: fields['Aim'] ?? null,
        fundingInstrument: fields['Funding Instrument'] ?? null,
        productionPlatforms: fields['Production Platform'] ?? [],
        sourceUrl: fields['URL'] ?? null,
    };
}