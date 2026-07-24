export class InvalidInvestmentError extends Error {
    constructor(reason: string) {
        super(reason);
        this.name = 'InvalidInvestmentError';
    }
}
