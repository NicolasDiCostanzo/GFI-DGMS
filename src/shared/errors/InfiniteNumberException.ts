export class InfiniteNumberException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InfiniteNumberException';
    }
}
