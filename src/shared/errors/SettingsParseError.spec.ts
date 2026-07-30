import { describe, expect, it } from 'vitest';
import { SettingsParseError } from './SettingsParseError';

describe('SettingsParseError', () => {
    it('is an Error subclass with the correct name and message', () => {
        const error = new SettingsParseError('Failed to parse settings from localStorage');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(SettingsParseError);
        expect(error.name).toBe('SettingsParseError');
        expect(error.message).toBe('Failed to parse settings from localStorage');
    });
});
