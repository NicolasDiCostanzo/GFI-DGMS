import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { validateNumeric } from '@/shared/utils/validateNumeric';
import { InvestmentExceedsMaxAllowedException } from './errors/InvestmentExceedsMaxAllowedException';

export class InvestmentAmount {
    readonly value: number;
    readonly maxAllowed: number;

    constructor(value: number, maxAllowed: number) {
        validateNumeric(value, 'InvestmentAmount', 'value');
        if (value < 0) {
            throw new InvalidNumberException('InvestmentAmount value must not be negative');
        }
        validateNumeric(maxAllowed, 'InvestmentAmount', 'maxAllowed');
        if (maxAllowed <= 0) {
            throw new NonPositiveNumberException(
                'InvestmentAmount maxAllowed must be greater than 0',
            );
        }
        if (value > maxAllowed) {
            throw new InvestmentExceedsMaxAllowedException(
                'InvestmentAmount value must not exceed maxAllowed',
            );
        }
        this.value = value;
        this.maxAllowed = maxAllowed;
    }
}
