import { describe, expect, it } from 'vitest';
import { NonPositiveNumberException } from './NonPositiveNumberException';

describe('NonPositiveNumberException', () => {
    it('is an Error subclass with the correct name and message', () => {
        const error = new NonPositiveNumberException('TargetBudget amount must be greater than 0');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(NonPositiveNumberException);
        expect(error.name).toBe('NonPositiveNumberException');
        expect(error.message).toBe('TargetBudget amount must be greater than 0');
    });
});
