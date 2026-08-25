import { Grant } from './Grant';
import { GrantCountryMismatchException } from './errors/GrantCountryMismatchException';
import { CountryName } from './CountryName';

export { CountryName } from './CountryName';

export class CountryFunding {
    readonly totalAmountUsd: number;
    readonly disclosedGrantCount: number;
    readonly grants: readonly Grant[];

    constructor(
        readonly countryName: CountryName,
        grants: readonly Grant[],
    ) {
        this.grants = Object.freeze([...grants]);
        const mismatchedGrant = this.grants.find((grant) => grant.country !== countryName);
        if (mismatchedGrant) {
            throw new GrantCountryMismatchException(
                `CountryFunding grant ${mismatchedGrant.id} has country ${mismatchedGrant.country}, expected ${countryName}`,
            );
        }
        const disclosedGrants = this.grants.filter(
            (grant): grant is Grant & { amountUsd: number } => grant.amountUsd !== null,
        );
        this.totalAmountUsd = disclosedGrants.reduce((sum, grant) => sum + grant.amountUsd, 0);
        this.disclosedGrantCount = disclosedGrants.length;
    }
}
