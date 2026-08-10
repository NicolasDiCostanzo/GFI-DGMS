import { describe, expect, it } from 'vitest';
import { NAMED_ERROR_CASES } from './namedErrors.spec.fixtures';

describe('NamedError subclasses', () => {
    it.each(NAMED_ERROR_CASES)(
        '%s is an Error subclass with the correct name and message',
        (name, ErrorClass, message) => {
            const error = new ErrorClass(message);

            expect(error).toBeInstanceOf(Error);
            expect(error).toBeInstanceOf(ErrorClass);
            expect(error.name).toBe(name);
            expect(error.message).toBe(message);
        },
    );
});
