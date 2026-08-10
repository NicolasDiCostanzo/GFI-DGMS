import { NamedError } from './NamedError';

export class InfiniteNumberException extends NamedError {
    constructor(message: string) {
        super('InfiniteNumberException', message);
    }
}
