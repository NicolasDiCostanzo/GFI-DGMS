export enum CurrencyCode {
    USD = 'USD',
    EUR = 'EUR',
}

export class Currency {
    readonly code: CurrencyCode;
    readonly symbol: string;
    readonly decimals: number;

    private constructor(code: CurrencyCode, symbol: string, decimals: number) {
        this.code = code;
        this.symbol = symbol;
        this.decimals = decimals;
    }

    static USD(): Currency {
        return new Currency(CurrencyCode.USD, '$', 2);
    }

    static EUR(): Currency {
        return new Currency(CurrencyCode.EUR, '€', 2);
    }

    format(amount: number): string {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: this.code,
            minimumFractionDigits: this.decimals,
            maximumFractionDigits: this.decimals,
        }).format(amount);
    }
}
