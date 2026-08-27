import { CountryFunding, CountryName } from '@/sovereign/domain/CountryFunding';
import { Grant } from '@/sovereign/domain/Grant';

export interface CountryFundingRepository {
    findByCountryName(name: CountryName): Promise<CountryFunding | null>;
    findAll(): Promise<CountryFunding[]>;
    findUnattributedGrants(): Promise<readonly Grant[]>;
}
