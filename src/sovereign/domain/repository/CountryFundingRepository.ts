import { CountryFunding, CountryName } from '../CountryFunding';
import { Grant } from '../Grant';

export interface CountryFundingRepository {
    findByCountryName(name: CountryName): Promise<CountryFunding | null>;
    findAll(): Promise<CountryFunding[]>;
    /** Grants with no single country (e.g. tagged "European Union" or "Other"), excluded from every CountryFunding. */
    findUnattributedGrants(): Promise<readonly Grant[]>;
}
