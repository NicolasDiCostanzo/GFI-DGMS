import { describe, expect, it } from 'vitest';
import { SettingsStorageError } from './SettingsStorageError';

describe('SettingsStorageError', () => {
    it('is an Error subclass with the correct name and message', () => {
        const error = new SettingsStorageError('Failed to save settings to localStorage');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(SettingsStorageError);
        expect(error.name).toBe('SettingsStorageError');
        expect(error.message).toBe('Failed to save settings to localStorage');
    });
});
