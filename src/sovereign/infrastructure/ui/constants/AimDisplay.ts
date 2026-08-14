import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { AIM_PALETTES } from './ThemeColors';

export type Aim = keyof typeof AIM_PALETTES;

export interface AimDisplay {
    readonly label: string;
    readonly shortLabel: string;
    readonly borderColor: string;
    readonly backgroundColor: string;
    readonly textColor: string;
}

const AIM_META: Record<Aim, { label: string; shortLabel: string }> = {
    'Research & Development': { label: 'Research & Development', shortLabel: 'R&D' },
    Commercialization: { label: 'Commercialization', shortLabel: 'Comm.' },
    Mixed: { label: 'Mixed', shortLabel: 'Mix' },
};

function isDarkMode(themeMode: ThemeMode): boolean {
    return themeMode === 'dark' || themeMode === 'colorblind-dark';
}

export function getAimDisplay(
    aim: string | null | undefined,
    themeMode: ThemeMode,
): AimDisplay | null {
    if (!aim || !Object.prototype.hasOwnProperty.call(AIM_PALETTES, aim)) return null;
    const paletteSet = AIM_PALETTES[aim as Aim];
    const palette = isDarkMode(themeMode) ? paletteSet.dark : paletteSet.light;
    const meta = AIM_META[aim as Aim];
    return {
        label: meta.label,
        shortLabel: meta.shortLabel,
        borderColor: palette.borderColor,
        backgroundColor: palette.backgroundColor,
        textColor: palette.textColor,
    };
}

export function getAimLegend(themeMode: ThemeMode): readonly AimDisplay[] {
    return Object.keys(AIM_PALETTES).map((a) => getAimDisplay(a, themeMode) as AimDisplay);
}
