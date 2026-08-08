export class SettingsParseError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'SettingsParseError';
    }
}
