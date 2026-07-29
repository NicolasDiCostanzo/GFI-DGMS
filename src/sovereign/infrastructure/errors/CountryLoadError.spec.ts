import { describe, expect, it } from 'vitest';
import { CountryLoadError } from './CountryLoadError';

describe('CountryLoadError', () => {
    it('is an Error subclass with the correct name and message', () => {
        const error = new CountryLoadError('network down');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(CountryLoadError);
        expect(error.name).toBe('CountryLoadError');
        expect(error.message).toBe('network down');
    });
});
