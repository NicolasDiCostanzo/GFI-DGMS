import { CountryFunding, CountryName } from '../../domain/CountryFunding';
import { CountryFundingRepository } from '../../domain/repository/CountryFundingRepository';
import { Grant, GrantId } from '../../domain/Grant';
import grantsData from '../data/grants.json';
import { GrantDataValidationError } from '../errors/GrantDataValidationError';

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

// Airtable's country name doesn't always match world-atlas's feature.properties.name
// (see src/sovereign/infrastructure/ui/composables/useCountryDisplay.ts), which the map
// uses to key country lookups. Reconciles the two so a country resolves under one name.
const COUNTRY_NAME_ALIASES: Readonly<Record<string, string>> = {
    'United States': 'United States of America',
    'The Netherlands': 'Netherlands',
};

// Not real countries — grants tagged with these have no single map region to attach to.
const NON_COUNTRY_VALUES = new Set(['European Union', 'Other']);

function resolveCountryName(rawCountry: string | null): string | null {
    if (rawCountry === null || NON_COUNTRY_VALUES.has(rawCountry)) {
        return null;
    }
    return COUNTRY_NAME_ALIASES[rawCountry] ?? rawCountry;
}

export class AirtableJsonCountryFundingRepository implements CountryFundingRepository {
    private readonly fundingByCountry: Map<string, CountryFunding>;

    constructor(data?: GrantRecord[]) {
        const records = data ?? (grantsData as GrantRecord[]);

        if (!Array.isArray(records) || records.length === 0) {
            throw new Error('Grant data file is missing or empty');
        }

        const grantsByCountry = new Map<string, Grant[]>();

        records.forEach((record, index) => {
            if (typeof record.id !== 'string' || record.id.trim() === '') {
                throw new GrantDataValidationError(
                    `Invalid grant record at index ${index + 1}: 'id' must be a non-empty string`,
                );
            }

            const canonicalCountry = resolveCountryName(record.country);
            if (canonicalCountry === null) {
                return;
            }

            const grant = new Grant(
                GrantId(record.id),
                canonicalCountry,
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

    async findByCountryName(name: CountryName): Promise<CountryFunding | null> {
        return this.fundingByCountry.get(name) ?? null;
    }

    async findAll(): Promise<CountryFunding[]> {
        return Array.from(this.fundingByCountry.values());
    }
}
