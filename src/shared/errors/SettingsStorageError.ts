export class SettingsStorageError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SettingsStorageError';
    }
}
