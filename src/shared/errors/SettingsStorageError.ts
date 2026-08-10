import { NamedError } from './NamedError';

export class SettingsStorageError extends NamedError {
    constructor(message: string) {
        super('SettingsStorageError', message);
    }
}
