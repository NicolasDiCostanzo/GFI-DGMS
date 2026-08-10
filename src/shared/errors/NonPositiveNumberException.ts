import { NamedError } from './NamedError';

export class NonPositiveNumberException extends NamedError {
    constructor(message: string) {
        super('NonPositiveNumberException', message);
    }
}
