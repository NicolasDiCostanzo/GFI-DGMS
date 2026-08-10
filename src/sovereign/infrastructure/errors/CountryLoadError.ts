import { NamedError } from '@/shared/errors/NamedError';

export class CountryLoadError extends NamedError {
    constructor(message: string) {
        super('CountryLoadError', message);
    }
}
