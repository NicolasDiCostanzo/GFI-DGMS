import { NamedError } from '@/shared/errors/NamedError';

export class InvestmentExceedsMaxAllowedException extends NamedError {
    constructor(message: string) {
        super('InvestmentExceedsMaxAllowedException', message);
    }
}
