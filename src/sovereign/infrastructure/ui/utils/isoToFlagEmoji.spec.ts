import { describe, expect, it } from 'vitest';
import { isoToFlagEmoji } from './isoToFlagEmoji';

const KNOWN_FLAGS: ReadonlyArray<[string, string]> = [
    ['276', '🇩🇪'],
    ['250', '🇫🇷'],
    ['826', '🇬🇧'],
    ['380', '🇮🇹'],
    ['724', '🇪🇸'],
    ['528', '🇳🇱'],
    ['616', '🇵🇱'],
    ['056', '🇧🇪'],
    ['752', '🇸🇪'],
    ['040', '🇦🇹'],
    ['372', '🇮🇪'],
    ['208', '🇩🇰'],
    ['246', '🇫🇮'],
    ['620', '🇵🇹'],
    ['300', '🇬🇷'],
    ['203', '🇨🇿'],
    ['642', '🇷🇴'],
    ['348', '🇭🇺'],
    ['703', '🇸🇰'],
    ['100', '🇧🇬'],
    ['191', '🇭🇷'],
    ['705', '🇸🇮'],
    ['440', '🇱🇹'],
    ['428', '🇱🇻'],
    ['233', '🇪🇪'],
    ['442', '🇱🇺'],
    ['196', '🇨🇾'],
    ['470', '🇲🇹'],
];

describe('isoToFlagEmoji', () => {
    it.each(KNOWN_FLAGS)('converts ISO numeric %s to %s', (code, expected) => {
        expect(isoToFlagEmoji(code)).toBe(expected);
    });

    it.each(['999', '', 'abc'])('returns empty string for invalid input %s', (input) => {
        expect(isoToFlagEmoji(input)).toBe('');
    });
});
