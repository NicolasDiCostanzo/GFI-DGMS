export class CountryLoadError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'CountryLoadError';
    }
}
