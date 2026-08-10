import { NamedError } from './NamedError';

export class InvalidNumberException extends NamedError {
    constructor(message: string) {
        super('InvalidNumberException', message);
    }
}
