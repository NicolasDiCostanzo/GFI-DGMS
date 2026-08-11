import { CountryFunding, CountryName } from '../CountryFunding';

export interface CountryFundingRepository {
    findByCountryName(name: CountryName): Promise<CountryFunding | null>;
    findAll(): Promise<CountryFunding[]>;
}
