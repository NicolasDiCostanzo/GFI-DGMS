import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';

export type Aim = 'Research & Development' | 'Commercialization' | 'Mixed';

export interface AimDisplay {
    readonly label: string;
    readonly shortLabel: string;
    readonly borderColor: string;
    readonly backgroundColor: string;
    readonly textColor: string;
}

interface AimPalette {
    readonly borderColor: string;
    readonly backgroundColor: string;
    readonly textColor: string;
}

interface AimEntry {
    readonly label: string;
    readonly shortLabel: string;
    readonly light: AimPalette;
    readonly dark: AimPalette;
}

// A table row is tinted by grant aim; color always pairs with the grid row's legend so the
// encoding is never color-only. Palettes diverge per light/dark family.
const AIM_ENTRIES: Readonly<Record<Aim, AimEntry>> = {
    'Research & Development': {
        label: 'Research & Development',
        shortLabel: 'R&D',
        light: {
            borderColor: '#1565c0',
            backgroundColor: 'rgba(21, 101, 192, 0.08)',
            textColor: '#1565c0',
        },
        dark: {
            borderColor: '#64b5f6',
            backgroundColor: 'rgba(100, 181, 246, 0.12)',
            textColor: '#64b5f6',
        },
    },
    Commercialization: {
        label: 'Commercialization',
        shortLabel: 'Comm.',
        light: {
            borderColor: '#2e7d32',
            backgroundColor: 'rgba(46, 125, 50, 0.08)',
            textColor: '#2e7d32',
        },
        dark: {
            borderColor: '#81c784',
            backgroundColor: 'rgba(129, 199, 132, 0.12)',
            textColor: '#81c784',
        },
    },
    Mixed: {
        label: 'Mixed',
        shortLabel: 'Mix',
        light: {
            borderColor: '#f57f17',
            backgroundColor: 'rgba(245, 127, 23, 0.08)',
            textColor: '#f57f17',
        },
        dark: {
            borderColor: '#ffd54f',
            backgroundColor: 'rgba(255, 213, 79, 0.12)',
            textColor: '#ffd54f',
        },
    },
};

const AIM_VALUES = Object.keys(AIM_ENTRIES) as readonly Aim[];

export function getAimDisplay(
    aim: string | null | undefined,
    themeMode: ThemeMode,
): AimDisplay | null {
    if (!aim || !AIM_VALUES.includes(aim as Aim)) {
        return null;
    }
    const entry = AIM_ENTRIES[aim as Aim];
    const palette =
        themeMode === 'dark' || themeMode === 'colorblind-dark' ? entry.dark : entry.light;
    return {
        label: entry.label,
        shortLabel: entry.shortLabel,
        borderColor: palette.borderColor,
        backgroundColor: palette.backgroundColor,
        textColor: palette.textColor,
    };
}

export function getAimLegend(themeMode: ThemeMode): readonly AimDisplay[] {
    return AIM_VALUES.map((aim) => getAimDisplay(aim, themeMode) as AimDisplay);
}
