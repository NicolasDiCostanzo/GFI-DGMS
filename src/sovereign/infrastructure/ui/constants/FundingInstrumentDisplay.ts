import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';

export interface FundingInstrumentDisplay {
    readonly family: string;
    readonly label: string;
    readonly color: string;
}

interface FamilyPalette {
    readonly light: string;
    readonly dark: string;
}

// Instruments are grouped into six families so the table can show a colored chip per row
// while still surfacing the exact instrument name. Families are colorblind-safe and diverge
// per light/dark theme.
const FAMILY_COLORS: Readonly<Record<string, FamilyPalette>> = {
    Research: { light: '#1565c0', dark: '#64b5f6' },
    Business: { light: '#2e7d32', dark: '#81c784' },
    Debt: { light: '#c62828', dark: '#ef5350' },
    Equity: { light: '#6a1b9a', dark: '#ba68c8' },
    Infrastructure: { light: '#00796b', dark: '#26a69a' },
    Other: { light: '#616161', dark: '#bdbdbd' },
};

const FAMILY_ORDER: readonly (keyof typeof FAMILY_COLORS)[] = [
    'Research',
    'Business',
    'Debt',
    'Equity',
    'Infrastructure',
    'Other',
];

// Maps each raw instrument value to its family and a cleaned display label.
const INSTRUMENT_ENTRIES: Readonly<
    Record<string, { readonly family: keyof typeof FAMILY_COLORS; readonly label: string }>
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
        const color = isDarkTheme(themeMode) ? FAMILY_COLORS.Other.dark : FAMILY_COLORS.Other.light;
        return { family: 'Other', label: 'Not specified', color };
    }
    const entry = INSTRUMENT_ENTRIES[instrument];
    const family = entry?.family ?? 'Other';
    const label = entry?.label ?? instrument;
    const color = isDarkTheme(themeMode) ? FAMILY_COLORS[family].dark : FAMILY_COLORS[family].light;
    return { family, label, color };
}

export function getFundingInstrumentLegend(
    themeMode: ThemeMode,
): readonly FundingInstrumentDisplay[] {
    const dark = isDarkTheme(themeMode);
    return FAMILY_ORDER.map((family) => ({
        family,
        label: family,
        color: dark ? FAMILY_COLORS[family].dark : FAMILY_COLORS[family].light,
    }));
}
