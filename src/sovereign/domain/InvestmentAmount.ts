import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';
import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { Currency } from '@/shared/types/Currency';
import { validateNumeric } from '@/shared/utils/validateNumeric';
import { TargetBudget } from './TargetBudget';

export class InvestmentAmount {
    readonly value: number;
    readonly currency: Currency;
    readonly maxAllowed: number;

    constructor(value: number, currency: Currency, maxAllowed: number) {
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
            throw new InvalidNumberException(
                'InvestmentAmount value must not exceed maxAllowed',
            );
        }
        this.value = value;
        this.currency = currency;
        this.maxAllowed = maxAllowed;
    }

    toPercentageOf(target: TargetBudget): number {
        return this.value / target.amount;
    }
}