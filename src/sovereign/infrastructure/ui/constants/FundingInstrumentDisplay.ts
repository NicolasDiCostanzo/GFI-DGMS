import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { INSTRUMENT_FAMILY_COLORS } from './ThemeColors';

export interface FundingInstrumentDisplay {
    readonly family: string;
    readonly label: string;
    readonly color: string;
}

const FAMILY_ORDER: readonly (keyof typeof INSTRUMENT_FAMILY_COLORS)[] = [
    'Research',
    'Business',
    'Debt',
    'Equity',
    'Infrastructure',
    'Other',
];

// Maps each raw instrument value to its family and a cleaned display label.
const INSTRUMENT_ENTRIES: Readonly<
    Record<
        string,
        { readonly family: keyof typeof INSTRUMENT_FAMILY_COLORS; readonly label: string }
    >
> = {
    'Research Grant': { family: 'Research', label: 'Research Grant' },
    'Bilateral Research Grant': { family: 'Research', label: 'Bilateral Research Grant' },
    Consortium: { family: 'Research', label: 'Consortium' },
    'Open Call': { family: 'Research', label: 'Open Call' },
    'Business Grant': { family: 'Business', label: 'Business Grant' },
    'Professional Services': { family: 'Business', label: 'Professional Services' },
    'Demonstration project': { family: 'Business', label: 'Demonstration project' },
    'Workforce & Education': { family: 'Business', label: 'Workforce & Education' },
    'Product Development': { family: 'Business', label: 'Product Development' },
    Loan: { family: 'Debt', label: 'Loan' },
    'Loan Commitment': { family: 'Debt', label: 'Loan Commitment' },
    'Loan Guarantee': { family: 'Debt', label: 'Loan Guarantee' },
    'Subordinated Loan': { family: 'Debt', label: 'Subordinated Loan' },
    'Equity Funding': { family: 'Equity', label: 'Equity Funding' },
    Investment: { family: 'Equity', label: 'Investment' },
    'Investment Fund': { family: 'Equity', label: 'Investment Fund' },
    'Facility Construction': { family: 'Infrastructure', label: 'Facility Construction' },
    Subsidies: { family: 'Infrastructure', label: 'Subsidies' },
    Commitment: { family: 'Infrastructure', label: 'Commitment' },
    Financing: { family: 'Infrastructure', label: 'Financing' },
    'Just Transition': { family: 'Infrastructure', label: 'Just Transition' },
    MIXED: { family: 'Other', label: 'Mixed' },
    Other: { family: 'Other', label: 'Other' },
};

function isDarkTheme(themeMode: ThemeMode): boolean {
    return themeMode === 'dark' || themeMode === 'colorblind-dark';
}

export function getFundingInstrumentDisplay(
    instrument: string | null | undefined,
    themeMode: ThemeMode,
): FundingInstrumentDisplay {
    if (!instrument) {
        const color = isDarkTheme(themeMode)
            ? INSTRUMENT_FAMILY_COLORS.Other.dark
            : INSTRUMENT_FAMILY_COLORS.Other.light;
        return { family: 'Other', label: 'Not specified', color };
    }
    const entry = INSTRUMENT_ENTRIES[instrument];
    const family = entry?.family ?? 'Other';
    const label = entry?.label ?? instrument;
    const color = isDarkTheme(themeMode)
        ? INSTRUMENT_FAMILY_COLORS[family].dark
        : INSTRUMENT_FAMILY_COLORS[family].light;
    return { family, label, color };
}

export function getFundingInstrumentLegend(
    themeMode: ThemeMode,
): readonly FundingInstrumentDisplay[] {
    const dark = isDarkTheme(themeMode);
    return FAMILY_ORDER.map((family) => ({
        family,
        label: family,
        color: dark
            ? INSTRUMENT_FAMILY_COLORS[family].dark
            : INSTRUMENT_FAMILY_COLORS[family].light,
    }));
}
