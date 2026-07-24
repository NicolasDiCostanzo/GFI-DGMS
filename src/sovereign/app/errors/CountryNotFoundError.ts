export class CountryNotFoundError extends Error {
    constructor(countryId: string) {
        super(`Country with ID ${countryId} not found`);
        this.name = 'CountryNotFoundError';
    }
}
