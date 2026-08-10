import { NamedError } from './NamedError';

export class SettingsParseError extends NamedError {
    constructor(message: string) {
        super('SettingsParseError', message);
    }
}
