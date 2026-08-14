import { NamedError } from '@/shared/errors/NamedError';

export class GrantCountryMismatchException extends NamedError {
    constructor(message: string) {
        super('GrantCountryMismatchException', message);
    }
}
