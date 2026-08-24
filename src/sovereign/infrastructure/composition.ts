import {
    GetCountryFundingOverview,
    type CountryFundingOverview,
} from '@/sovereign/app/GetCountryFundingOverview';
import {
    AirtableJsonCountryFundingRepository,
    loadGrantRecords,
} from '@/sovereign/infrastructure/adapters/AirtableJsonCountryFundingRepository';

export async function loadCountryFundingOverview(): Promise<CountryFundingOverview> {
    const records = await loadGrantRecords();
    const countryFundingRepository = new AirtableJsonCountryFundingRepository(records);
    return new GetCountryFundingOverview(countryFundingRepository).execute();
}
