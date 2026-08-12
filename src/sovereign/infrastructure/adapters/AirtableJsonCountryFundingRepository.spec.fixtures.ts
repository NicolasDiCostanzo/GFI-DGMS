import { GrantDataValidationError } from '../errors/GrantDataValidationError';
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

/**
 * Builds a grant record fixture by applying property overrides to the valid record.
 *
 * @param overrides - Properties to replace in the valid record
 * @returns An array containing the resulting grant record
 */
export function buildInvalidRecord(overrides: Record<string, unknown>): GrantRecord[] {
    return [buildRecord(overrides as Partial<GrantRecord>)] as unknown as GrantRecord[];
}

export const VALIDATION_CASES: ReadonlyArray<
    [title: string, overrides: Record<string, unknown>, expected: new (message: string) => Error]
> = [
    [
        'GrantDataValidationError when fundingAmountUsd is a string',
        { fundingAmountUsd: 'invalid' },
        GrantDataValidationError,
    ],
    [
        'GrantDataValidationError when fundingAmountUsd is NaN',
        { fundingAmountUsd: NaN },
        GrantDataValidationError,
    ],
    [
        'GrantDataValidationError when fundingAmountUsd is Infinity',
        { fundingAmountUsd: Infinity },
        GrantDataValidationError,
    ],
    [
        'GrantDataValidationError when funderAgencies is missing',
        { funderAgencies: undefined },
        GrantDataValidationError,
    ],
    [
        'GrantDataValidationError when funderAgencies is not an array',
        { funderAgencies: 'Bpifrance' },
        GrantDataValidationError,
    ],
    [
        'GrantDataValidationError when funderAgencies contains a non-string',
        { funderAgencies: [42] },
        GrantDataValidationError,
    ],
    [
        'GrantDataValidationError when yearsDisbursed is missing',
        { yearsDisbursed: undefined },
        GrantDataValidationError,
    ],
    [
        'GrantDataValidationError when yearsDisbursed contains a non-string',
        { yearsDisbursed: [2024] },
        GrantDataValidationError,
    ],
    [
        'GrantDataValidationError when productionPlatforms is missing',
        { productionPlatforms: undefined },
        GrantDataValidationError,
    ],
    [
        'GrantDataValidationError when productionPlatforms is not an array',
        { productionPlatforms: 'Cultivated' },
        GrantDataValidationError,
    ],
    [
        'GrantDataValidationError when a nullable scalar is not a string',
        { projectTitle: 123 },
        GrantDataValidationError,
    ],
    [
        'GrantDataValidationError when country is not a string',
        { country: 456 },
        GrantDataValidationError,
    ],
];
