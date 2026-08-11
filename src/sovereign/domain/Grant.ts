export type GrantId = string & { readonly _brand: 'GrantId' };
export const GrantId = (id: string): GrantId => id as GrantId;

export class Grant {
    constructor(
        readonly id: GrantId,
        readonly country: string,
        readonly projectTitle: string | null,
        readonly amountUsd: number | null,
        readonly funderAgencies: readonly string[],
        readonly funderName: string | null,
        readonly recipients: string | null,
        readonly description: string | null,
        readonly aim: string | null,
        readonly fundingInstrument: string | null,
        readonly productionPlatforms: readonly string[],
        readonly yearsDisbursed: readonly string[],
        readonly sourceUrl: string | null,
    ) {}
}
