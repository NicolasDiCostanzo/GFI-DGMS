import { CountryFunding, CountryName } from '../CountryFunding';
import { Grant } from '../Grant';

export interface CountryFundingRepository {
    findByCountryName(name: CountryName): Promise<CountryFunding | null>;
    findAll(): Promise<CountryFunding[]>;
    findUnattributedGrants(): Promise<readonly Grant[]>;
}
