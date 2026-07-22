export class InvalidNumberException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvalidNumberException';
    }
}
