import { describe, expect, it } from 'vitest';
import { validateSourceUrl } from './validateSourceUrl';

describe('validateSourceUrl', () => {
    it.each([
        ['https://example.com/grant', 'https://example.com/grant'],
        ['http://example.com/grant', 'http://example.com/grant'],
    ])('returns the parsed URL for an absolute %s URL', (sourceUrl, expected) => {
        expect(validateSourceUrl(sourceUrl)).toBe(expected);
    });

    it.each([['javascript:alert(1)'], ['data:text/html,<script>alert(1)</script>'], ['not a url']])(
        'returns null for a non-http(s) or unparseable value (%s)',
        (sourceUrl) => {
            expect(validateSourceUrl(sourceUrl)).toBeNull();
        },
    );

    it('returns null for a null or empty sourceUrl', () => {
        expect(validateSourceUrl(null)).toBeNull();
        expect(validateSourceUrl('')).toBeNull();
    });
});
