import { describe, expect, it } from 'vitest';
import { InfiniteNumberException } from './InfiniteNumberException';

describe('InfiniteNumberException', () => {
    it('is an Error subclass with the correct name and message', () => {
        const error = new InfiniteNumberException('TargetBudget amount must be finite');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(InfiniteNumberException);
        expect(error.name).toBe('InfiniteNumberException');
        expect(error.message).toBe('TargetBudget amount must be finite');
    });
});
