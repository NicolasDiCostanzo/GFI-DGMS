import { describe, expect, it } from 'vitest';
import { resolveCountryName } from './resolveCountryName';

describe('resolveCountryName', () => {
    it.each([
        ['United States', 'United States of America'],
        ['The Netherlands', 'Netherlands'],
    ])('aliases %s to %s', (rawCountry, expected) => {
        expect(resolveCountryName(rawCountry)).toBe(expected);
    });

    it.each([['European Union'], ['Other']])(
        'returns null for the non-country value %s',
        (rawCountry) => {
            expect(resolveCountryName(rawCountry)).toBeNull();
        },
    );

    it('returns null for a null country', () => {
        expect(resolveCountryName(null)).toBeNull();
    });

    it('returns an unrecognized country name unchanged', () => {
        expect(resolveCountryName('France')).toBe('France');
    });
});
