export type GrantId = string & { readonly _brand: 'GrantId' };
export const GrantId = (id: string): GrantId => id as GrantId;

export class Grant {
    readonly funderAgencies: readonly string[];
    readonly productionPlatforms: readonly string[];
    readonly yearsDisbursed: readonly string[];

    constructor(
        readonly id: GrantId,
        readonly country: string,
        readonly projectTitle: string | null,
        readonly amountUsd: number | null,
        funderAgencies: readonly string[],
        readonly funderName: string | null,
        readonly recipients: string | null,
        readonly description: string | null,
        readonly aim: string | null,
        readonly fundingInstrument: string | null,
        productionPlatforms: readonly string[],
        yearsDisbursed: readonly string[],
        readonly sourceUrl: string | null,
    ) {
        this.funderAgencies = Object.freeze([...funderAgencies]);
        this.productionPlatforms = Object.freeze([...productionPlatforms]);
        this.yearsDisbursed = Object.freeze([...yearsDisbursed]);
    }
}
