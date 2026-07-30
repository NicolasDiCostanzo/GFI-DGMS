const ISO_NUMERIC_TO_ALPHA2: Readonly<Record<string, string>> = {
    '276': 'DE',
    '250': 'FR',
    '826': 'GB',
    '380': 'IT',
    '724': 'ES',
    '528': 'NL',
    '616': 'PL',
    '056': 'BE',
    '752': 'SE',
    '040': 'AT',
    '372': 'IE',
    '208': 'DK',
    '246': 'FI',
    '620': 'PT',
    '300': 'GR',
    '203': 'CZ',
    '642': 'RO',
    '348': 'HU',
    '703': 'SK',
    '100': 'BG',
    '191': 'HR',
    '705': 'SI',
    '440': 'LT',
    '428': 'LV',
    '233': 'EE',
    '442': 'LU',
    '196': 'CY',
    '470': 'MT',
};

const REGIONAL_INDICATOR_OFFSET = 0x1f1e6;

function alpha2ToFlagEmoji(alpha2: string): string {
    const upper = alpha2.toUpperCase();
    if (upper.length !== 2 || !/^[A-Z]{2}$/.test(upper)) {
        return '';
    }
    const char1 = String.fromCodePoint(upper.charCodeAt(0) - 65 + REGIONAL_INDICATOR_OFFSET);
    const char2 = String.fromCodePoint(upper.charCodeAt(1) - 65 + REGIONAL_INDICATOR_OFFSET);
    return char1 + char2;
}

export function isoToFlagEmoji(isoNumeric: string): string {
    const alpha2 = ISO_NUMERIC_TO_ALPHA2[isoNumeric];
    if (!alpha2) {
        return '';
    }
    return alpha2ToFlagEmoji(alpha2);
}
