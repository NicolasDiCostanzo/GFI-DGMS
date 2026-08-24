import { CountryFunding, CountryName } from '@/sovereign/domain/CountryFunding';
import { Grant, GrantId } from '@/sovereign/domain/Grant';
import { CountryFundingRepository } from '@/sovereign/domain/repository/CountryFundingRepository';
import { GrantDataValidationError } from '@/sovereign/infrastructure/errors/GrantDataValidationError';

const GRANT_DATA_URL =
    'https://cdn.jsdelivr.net/gh/NicolasDiCostanzo/GFI-DGMS@main/src/sovereign/infrastructure/data/grants.json';

export async function loadGrantRecords(): Promise<GrantRecord[]> {
    const response = await fetch(GRANT_DATA_URL);
    if (!response.ok) {
        throw new Error(`Failed to load grant data: ${response.status} ${response.statusText}`);
    }
    const payload: unknown = await response.json();
    if (!Array.isArray(payload)) {
        throw new Error('Failed to load grant data: payload must be an array of grant records');
    }
    return payload;
}

export interface GrantRecord {
    id: string;
    dateAnnounced: string | null;
    country: string | null;
    funderAgencies: string[];
    funderName: string | null;
    recipients: string | null;
    projectTitle: string | null;
    description: string | null;
    fundingAmountUsd: number | null;
    yearForAnnualFigures: string | null;
    yearsDisbursed: string[];
    aim: string | null;
    fundingInstrument: string | null;
    productionPlatforms: string[];
    sourceUrl: string | null;
}

const COUNTRY_NAME_ALIASES: Readonly<Record<string, string>> = {
    'United States': 'United States of America',
    'The Netherlands': 'Netherlands',
};

const NON_COUNTRY_VALUES = new Set(['European Union', 'Other']);

function resolveCountryName(rawCountry: string | null): string | null {
    if (rawCountry === null || NON_COUNTRY_VALUES.has(rawCountry)) {
        return null;
    }
    return COUNTRY_NAME_ALIASES[rawCountry] ?? rawCountry;
}

export class AirtableJsonCountryFundingRepository implements CountryFundingRepository {
    private readonly fundingByCountry: Map<string, CountryFunding>;
    private readonly unattributedGrants: Grant[] = [];

    constructor(records: GrantRecord[]) {
        if (!Array.isArray(records) || records.length === 0) {
            throw new Error('Grant data file is missing or empty');
        }

        const grantsByCountry = new Map<string, Grant[]>();

        records.forEach((record, index) => {
            this.validateRecord(record, index + 1);

            const canonicalCountry = resolveCountryName(record.country);
            const grant = new Grant(
                GrantId(record.id),
                CountryName(canonicalCountry ?? record.country ?? 'Unknown'),
                record.projectTitle,
                record.fundingAmountUsd,
                record.funderAgencies,
                record.funderName,
                record.recipients,
                record.description,
                record.aim,
                record.fundingInstrument,
                record.productionPlatforms,
                record.yearsDisbursed,
                record.sourceUrl,
            );

            if (canonicalCountry === null) {
                this.unattributedGrants.push(grant);
                return;
            }

            const countryGrants = grantsByCountry.get(canonicalCountry) ?? [];
            countryGrants.push(grant);
            grantsByCountry.set(canonicalCountry, countryGrants);
        });

        this.fundingByCountry = new Map(
            [...grantsByCountry.entries()].map(([country, countryGrants]) => [
                country,
                new CountryFunding(CountryName(country), countryGrants),
            ]),
        );
    }

    private assertNullableString(record: GrantRecord, index: number, fieldName: string): void {
        const value = record[fieldName as keyof GrantRecord];
        if (value !== null && typeof value !== 'string') {
            throw new GrantDataValidationError(
                `Invalid grant record at index ${index}: '${fieldName}' must be a string or null`,
            );
        }
    }

    private assertStringArray(record: GrantRecord, index: number, fieldName: string): void {
        const value = record[fieldName as keyof GrantRecord];
        if (!Array.isArray(value) || value.some((entry) => typeof entry !== 'string')) {
            throw new GrantDataValidationError(
                `Invalid grant record at index ${index}: '${fieldName}' must be an array of strings`,
            );
        }
    }

    private validateRecord(record: GrantRecord, index: number): void {
        if (typeof record !== 'object' || record === null || Array.isArray(record)) {
            throw new GrantDataValidationError(
                `Invalid grant record at index ${index}: record must be an object`,
            );
        }

        if (typeof record.id !== 'string' || record.id.trim() === '') {
            throw new GrantDataValidationError(
                `Invalid grant record at index ${index}: 'id' must be a non-empty string`,
            );
        }

        this.assertNullableString(record, index, 'dateAnnounced');
        this.assertNullableString(record, index, 'country');
        this.assertStringArray(record, index, 'funderAgencies');
        this.assertNullableString(record, index, 'funderName');
        this.assertNullableString(record, index, 'recipients');
        this.assertNullableString(record, index, 'projectTitle');
        this.assertNullableString(record, index, 'description');

        const fundingAmountUsd = record.fundingAmountUsd;
        if (fundingAmountUsd !== null && typeof fundingAmountUsd !== 'number') {
            throw new GrantDataValidationError(
                `Invalid grant record at index ${index}: 'fundingAmountUsd' must be a number or null`,
            );
        }
        if (typeof fundingAmountUsd === 'number' && !Number.isFinite(fundingAmountUsd)) {
            throw new GrantDataValidationError(
                `Invalid grant record at index ${index}: 'fundingAmountUsd' must be finite`,
            );
        }

        this.assertNullableString(record, index, 'yearForAnnualFigures');
        this.assertStringArray(record, index, 'yearsDisbursed');
        this.assertNullableString(record, index, 'aim');
        this.assertNullableString(record, index, 'fundingInstrument');
        this.assertStringArray(record, index, 'productionPlatforms');
        this.assertNullableString(record, index, 'sourceUrl');
    }

    async findByCountryName(name: CountryName): Promise<CountryFunding | null> {
        return this.fundingByCountry.get(name) ?? null;
    }

    async findAll(): Promise<CountryFunding[]> {
        return Array.from(this.fundingByCountry.values());
    }

    async findUnattributedGrants(): Promise<readonly Grant[]> {
        return this.unattributedGrants;
    }
}
