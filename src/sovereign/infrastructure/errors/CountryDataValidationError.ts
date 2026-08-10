import { NamedError } from '@/shared/errors/NamedError';

export class CountryDataValidationError extends NamedError {
    constructor(message: string) {
        super('CountryDataValidationError', message);
    }
}
