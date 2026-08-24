import { CountryName } from '@/sovereign/domain/CountryName';
import { Grant, GrantId } from '@/sovereign/domain/Grant';
import type { AimDisplay } from '@/sovereign/infrastructure/ui/constants/AimDisplay';
import type { FundingInstrumentDisplay } from '@/sovereign/infrastructure/ui/constants/FundingInstrumentDisplay';
import type { PlatformSegment } from '@/sovereign/infrastructure/ui/constants/ProductionPlatformSegments';
import type { EnrichedGrantRow } from './GrantTable.types';

export const aimDisplay: AimDisplay = {
    label: 'Research & Development',
    shortLabel: 'R&D',
    borderColor: 'rgb(18, 52, 86)',
    backgroundColor: 'rgb(171, 205, 239)',
    textColor: 'rgb(0, 0, 0)',
};

export const instrumentDisplay: FundingInstrumentDisplay = {
    family: 'Research',
    label: 'Research Grant',
    color: 'rgb(101, 67, 33)',
};

export const platformSegments: readonly PlatformSegment[] = [
    { label: 'Plant-based', active: true },
    { label: 'Cultivated', active: true },
];

type GrantOverrides = Partial<{
    id: string;
    country: string;
    projectTitle: string | null;
    amountUsd: number | null;
    funderAgencies: readonly string[];
    funderName: string | null;
    recipients: string | null;
    description: string | null;
    aim: string | null;
    fundingInstrument: string | null;
    productionPlatforms: readonly string[];
    yearsDisbursed: readonly string[];
    sourceUrl: string | null;
}>;

function withDefault<T>(value: T | undefined, fallback: T): T {
    return value !== undefined ? value : fallback;
}

export function makeGrantFor(overrides: GrantOverrides = {}): Grant {
    return new Grant(
        GrantId(withDefault(overrides.id, 'g-row')),
        CountryName(withDefault(overrides.country, 'DE')),
        withDefault(overrides.projectTitle, 'Row project'),
        withDefault(overrides.amountUsd, 1_500_000),
        withDefault(overrides.funderAgencies, ['Agency A', 'Agency B']),
        withDefault(overrides.funderName, 'Funder'),
        withDefault(overrides.recipients, 'Recipient'),
        withDefault(overrides.description, 'Description text'),
        withDefault(overrides.aim, null),
        withDefault(overrides.fundingInstrument, null),
        withDefault(overrides.productionPlatforms, []),
        withDefault(overrides.yearsDisbursed, ['2021', '2022']),
        withDefault(overrides.sourceUrl, 'https://example.com/announcement'),
    );
}

export function makeEnrichedRow(overrides: Partial<EnrichedGrantRow> = {}): EnrichedGrantRow {
    const grant = overrides.grant ?? makeGrantFor();
    return {
        grant,
        sourceUrl: grant.sourceUrl,
        aim: null,
        instrument: instrumentDisplay,
        segments: null,
        ...overrides,
    };
}
