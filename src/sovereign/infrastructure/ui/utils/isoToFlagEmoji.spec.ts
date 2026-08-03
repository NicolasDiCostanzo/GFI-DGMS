import { describe, expect, it } from 'vitest';
import { isoToFlagEmoji } from './isoToFlagEmoji';
import { KNOWN_FLAGS } from './isoToFlagEmoji.spec.fixtures';

describe('isoToFlagEmoji', () => {
    it.each(KNOWN_FLAGS)('converts ISO numeric %s to %s', (code, expected) => {
        expect(isoToFlagEmoji(code)).toBe(expected);
    });

    it.each(['999', '', 'abc'])('returns empty string for invalid input %s', (input) => {
        expect(isoToFlagEmoji(input)).toBe('');
    });
});
