export class NonPositiveNumberException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'NonPositiveNumberException';
    }
}
