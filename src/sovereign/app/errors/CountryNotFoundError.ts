import { NamedError } from '@/shared/errors/NamedError';

export class CountryNotFoundError extends NamedError {
    constructor(countryId: string) {
        super('CountryNotFoundError', `Country with ID ${countryId} not found`);
    }
}
