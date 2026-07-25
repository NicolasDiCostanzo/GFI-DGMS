export class CountryDataValidationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CountryDataValidationError';
    }
}
