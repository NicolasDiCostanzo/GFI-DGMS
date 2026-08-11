import { parseFundingEstimate } from './parseFundingEstimate.mjs';

/**
 * Maps a raw Airtable record from the SOGPR Web View table into the clean shape
 * committed to the repo. Airtable omits empty fields from its API response entirely
 * (rather than sending null), so every field is read with a default.
 */
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
