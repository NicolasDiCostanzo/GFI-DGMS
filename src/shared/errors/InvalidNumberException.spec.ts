import { describe, expect, it } from 'vitest';
import { InvalidNumberException } from './InvalidNumberException';

describe('InvalidNumberException', () => {
    it('is an Error subclass with the correct name and message', () => {
        const error = new InvalidNumberException('TargetBudget amount must not be NaN');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(InvalidNumberException);
        expect(error.name).toBe('InvalidNumberException');
        expect(error.message).toBe('TargetBudget amount must not be NaN');
    });
});
