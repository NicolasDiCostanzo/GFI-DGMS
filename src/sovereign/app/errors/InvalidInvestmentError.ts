import { NamedError } from '@/shared/errors/NamedError';

export class InvalidInvestmentError extends NamedError {
    constructor(reason: string) {
        super('InvalidInvestmentError', reason);
    }
}
