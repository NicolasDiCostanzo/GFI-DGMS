export type ThemeMode = 'light' | 'dark' | 'colorblind-light' | 'colorblind-dark';

export const BASE_COLORS = {
    RED: '#d32f2f',
    GREY: '#cccccc',
    BLUE: '#2196f3',
    AQUA: '#e8f4f8',
    BLACK: '#000000',
} as const;

export function isDarkTheme(mode: ThemeMode): boolean {
    return mode === 'dark' || mode === 'colorblind-dark';
}

function hexToRgbChannels(hexColor: string): { r: number; g: number; b: number } {
    const hex = hexColor.replace('#', '');
    return {
        r: parseInt(hex.slice(0, 2), 16),
        g: parseInt(hex.slice(2, 4), 16),
        b: parseInt(hex.slice(4, 6), 16),
    };
}

export function toRGB(hexColor: string): string {
    const { r, g, b } = hexToRgbChannels(hexColor);
    return `rgb(${r}, ${g}, ${b})`;
}

export function toRgba(hexColor: string, alpha: number): string {
    const { r, g, b } = hexToRgbChannels(hexColor);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
