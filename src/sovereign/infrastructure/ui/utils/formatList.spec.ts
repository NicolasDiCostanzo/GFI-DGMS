import { describe, expect, it } from 'vitest';
import { formatList } from './formatList';

describe('formatList', () => {
    it('joins values with a comma and space', () => {
        expect(formatList(['Agency A', 'Agency B'])).toBe('Agency A, Agency B');
    });

    it('returns the fallback text for an empty list', () => {
        expect(formatList([])).toBe('Not specified');
    });
});
