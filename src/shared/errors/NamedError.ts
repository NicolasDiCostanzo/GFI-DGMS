export abstract class NamedError extends Error {
    protected constructor(name: string, message: string) {
        super(message);
        this.name = name;
    }
}
