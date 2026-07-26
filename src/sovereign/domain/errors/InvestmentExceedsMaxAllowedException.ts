export class InvestmentExceedsMaxAllowedException extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'InvestmentExceedsMaxAllowedException';
    }
}
