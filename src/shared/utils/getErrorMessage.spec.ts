import { describe, expect, it } from 'vitest';
import { getErrorMessage } from './getErrorMessage';
import { ERROR_MESSAGE_CASES } from './getErrorMessage.spec.fixtures';

describe('getErrorMessage', () => {
    it.each(ERROR_MESSAGE_CASES)('%s', (_title, input, expected) => {
        expect(getErrorMessage(input)).toBe(expected);
    });
});
