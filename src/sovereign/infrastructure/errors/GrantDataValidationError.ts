import { NamedError } from '@/shared/errors/NamedError';

export class GrantDataValidationError extends NamedError {
    constructor(message: string) {
        super('GrantDataValidationError', message);
    }
}
