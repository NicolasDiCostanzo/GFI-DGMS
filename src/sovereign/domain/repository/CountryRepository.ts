import { Country, CountryId } from '../Country';

export interface CountryRepository {
    findById(id: CountryId): Promise<Country | null>;
    findAll(): Promise<Country[]>;
}
