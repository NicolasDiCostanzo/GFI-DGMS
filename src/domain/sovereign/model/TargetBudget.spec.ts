import { Currency } from '@/shared/types/Currency';
import { describe, expect, it } from 'vitest';
import { DomainError } from './DomainError';
import { TargetBudget } from './TargetBudget';

describe('DomainError', () => {
    it('is an Error subclass with the correct name and message', () => {
        const error = new DomainError('TargetBudget amount must be greater than 0');

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(DomainError);
        expect(error.name).toBe('DomainError');
        expect(error.message).toBe('TargetBudget amount must be greater than 0');
    });
});

describe('TargetBudget', () => {
    describe('constructor', () => {
        it('creates a TargetBudget with amount and currency', () => {
            const usd = Currency.USD();
            const target = new TargetBudget(1000, usd);

            expect(target.amount).toBe(1000);
            expect(target.currency).toBe(usd);
        });

        it('throws DomainError when amount is zero', () => {
            expect(() => new TargetBudget(0, Currency.USD())).toThrow(DomainError);
        });

        it('throws DomainError when amount is negative', () => {
            expect(() => new TargetBudget(-500, Currency.USD())).toThrow(DomainError);
        });

        it('throws DomainError with a descriptive message', () => {
            expect(() => new TargetBudget(0, Currency.USD())).toThrow(
                'TargetBudget amount must be greater than 0',
            );
        });
    });

    describe('percentageOf()', () => {
        const target = new TargetBudget(1000, Currency.USD());

        it('returns 0.0 when actual is zero', () => {
            expect(target.percentageOf(0)).toBe(0);
        });

        it('returns 0.5 when actual is half the target', () => {
            expect(target.percentageOf(500)).toBe(0.5);
        });

        it('returns 1.0 when actual equals the target', () => {
            expect(target.percentageOf(1000)).toBe(1);
        });

        it('returns 2.0 when actual is double the target', () => {
            expect(target.percentageOf(2000)).toBe(2);
        });

        it('returns 3.0 when actual is triple the target', () => {
            expect(target.percentageOf(3000)).toBe(3);
        });
    });
});
