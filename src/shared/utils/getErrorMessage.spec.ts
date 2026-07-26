import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './getErrorMessage';

describe('getErrorMessage', () => {
    it('extracts message from Error instances', () => {
        expect(getErrorMessage(new Error('Something went wrong'))).toBe('Something went wrong');
    });

    it('converts non-Error values to string', () => {
        expect(getErrorMessage('just a string')).toBe('just a string');
    });

    it('converts objects to their string representation', () => {
        const obj = { key: 'value' };
        expect(getErrorMessage(obj)).toBe(String(obj));
    });

    it('converts null to string', () => {
        expect(getErrorMessage(null)).toBe('null');
    });

    it('converts numbers to string', () => {
        expect(getErrorMessage(42)).toBe('42');
    });
});
