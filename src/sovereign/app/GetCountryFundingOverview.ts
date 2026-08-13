import { CountryFunding } from '../domain/CountryFunding';
import { Grant } from '../domain/Grant';
import { CountryFundingRepository } from '../domain/repository/CountryFundingRepository';

export interface CountryFundingOverview {
    readonly countryFundings: CountryFunding[];
    readonly unattributedGrants: readonly Grant[];
}

export class GetCountryFundingOverview {
    constructor(private readonly countryFundingRepository: CountryFundingRepository) {}

    async execute(): Promise<CountryFundingOverview> {
        const [countryFundings, unattributedGrants] = await Promise.all([
            this.countryFundingRepository.findAll(),
            this.countryFundingRepository.findUnattributedGrants(),
        ]);

        return { countryFundings, unattributedGrants };
    }
}
