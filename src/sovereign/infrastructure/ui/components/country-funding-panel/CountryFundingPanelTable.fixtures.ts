import { CountryName } from '@/sovereign/domain/CountryName';
import { Grant, GrantId } from '@/sovereign/domain/Grant';

export function makeGrant(
    overrides: Partial<{
        id: string;
        country: string;
        projectTitle: string;
        amountUsd: number | string;
        funderAgencies: string[];
        funderName: string;
        recipients: string;
        description: string | null;
        aim: string | null;
        fundingInstrument: string | null;
        productionPlatforms: string[];
        yearsDisbursed: number[] | string[];
        sourceUrl: string | null;
    }>,
) {
    const id = typeof overrides.id === 'string' ? overrides.id : 'g1';
    const country = typeof overrides.country === 'string' ? overrides.country : 'X';
    const projectTitle =
        typeof overrides.projectTitle === 'string' ? overrides.projectTitle : 'Project';
    const amountUsd =
        typeof overrides.amountUsd === 'number'
            ? overrides.amountUsd
            : typeof overrides.amountUsd === 'string'
              ? Number(overrides.amountUsd)
              : 1_000_000;
    const funderAgencies = Array.isArray(overrides.funderAgencies)
        ? (overrides.funderAgencies as string[])
        : ['Agency A'];
    const funderName = typeof overrides.funderName === 'string' ? overrides.funderName : 'Funder';
    const recipients =
        typeof overrides.recipients === 'string' ? overrides.recipients : 'Recipient';
    const description = typeof overrides.description === 'string' ? overrides.description : null;
    const aim = typeof overrides.aim === 'string' ? overrides.aim : null;
    const fundingInstrument =
        typeof overrides.fundingInstrument === 'string' ? overrides.fundingInstrument : null;
    const productionPlatforms = Array.isArray(overrides.productionPlatforms)
        ? (overrides.productionPlatforms as string[])
        : [];

    const yearsDisbursed: string[] = Array.isArray(overrides.yearsDisbursed)
        ? (overrides.yearsDisbursed as (number | string)[]).map((y) => String(y))
        : [];
    const sourceUrl = typeof overrides.sourceUrl === 'string' ? overrides.sourceUrl : null;

    return new Grant(
        GrantId(id),
        CountryName(country),
        projectTitle,
        amountUsd,
        funderAgencies,
        funderName,
        recipients,
        description,
        aim,
        fundingInstrument,
        productionPlatforms,
        yearsDisbursed,
        sourceUrl,
    );
}

export const basicGrant = makeGrant({ id: 'g-basic', projectTitle: 'Basic' });

export const longDescriptionGrant = makeGrant({
    id: 'g-long',
    description: 'L'.repeat(300),
});

export const invalidUrlGrant = makeGrant({ id: 'g-bad-url', sourceUrl: 'not-a-url' });

export const customDefaultsGrant = makeGrant({
    country: 'FR',
    amountUsd: '2500000',
    funderName: 'Custom Funder',
    recipients: 'Custom Recipient',
});

export const multipleGrants = [
    basicGrant,
    longDescriptionGrant,
    makeGrant({ id: 'g-2', sourceUrl: 'https://a.test' }),
    invalidUrlGrant,
];

export const cardSortGrants = [
    makeGrant({ id: 'g-banana', projectTitle: 'Banana Project' }),
    makeGrant({ id: 'g-apple', projectTitle: 'Apple Project' }),
    makeGrant({ id: 'g-cherry', projectTitle: 'Cherry Project' }),
];

export const sampleColumnOrders: ReadonlyArray<ReadonlyArray<string>> = [
    ['projectTitle', 'url', 'amountUsd'],
    ['amountUsd', 'projectTitle', 'recipients', 'url'],
    ['platform', 'projectTitle', 'url'],
];
