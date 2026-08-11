import { Grant } from './Grant';
import { GrantCountryMismatchException } from './errors/GrantCountryMismatchException';

export type CountryName = string & { readonly _brand: 'CountryName' };
export const CountryName = (name: string): CountryName => name as CountryName;

export class CountryFunding {
    readonly totalAmountUsd: number;
    readonly disclosedGrantCount: number;

    constructor(
        readonly countryName: CountryName,
        readonly grants: readonly Grant[],
    ) {
        const mismatchedGrant = grants.find((grant) => grant.country !== countryName);
        if (mismatchedGrant) {
            throw new GrantCountryMismatchException(
                `CountryFunding grant ${mismatchedGrant.id} has country ${mismatchedGrant.country}, expected ${countryName}`,
            );
        }
        const disclosedGrants = grants.filter(
            (grant): grant is Grant & { amountUsd: number } => grant.amountUsd !== null,
        );
        this.totalAmountUsd = disclosedGrants.reduce((sum, grant) => sum + grant.amountUsd, 0);
        this.disclosedGrantCount = disclosedGrants.length;
    }
}
