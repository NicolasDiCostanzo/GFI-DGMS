import { describe, expect, it } from 'vitest';
import { InvestmentExceedsMaxAllowedException } from './InvestmentExceedsMaxAllowedException';

describe('InvestmentExceedsMaxAllowedException', () => {
    it('is an Error subclass with the correct name and message', () => {
        const error = new InvestmentExceedsMaxAllowedException(
            'InvestmentAmount value must not exceed maxAllowed',
        );

        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(InvestmentExceedsMaxAllowedException);
        expect(error.name).toBe('InvestmentExceedsMaxAllowedException');
        expect(error.message).toBe('InvestmentAmount value must not exceed maxAllowed');
    });
});
