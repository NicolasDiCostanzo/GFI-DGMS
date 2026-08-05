import { MAX_FUNDING_PROGRESS_RATIO } from '../domain/constants/FundingConstants';
import { type ThemeMode } from '../domain/constants/MapColors';
import { CountryId } from '../domain/Country';
import { InvestmentExceedsMaxAllowedException } from '../domain/errors/InvestmentExceedsMaxAllowedException';
import { InvestmentAmount } from '../domain/InvestmentAmount';
import { CountryRepository } from '../domain/repository/CountryRepository';
import { Simulation } from '../domain/Simulation';
import { SimulationResults } from '../domain/SimulationResults';
import { CountryNotFoundError } from './errors/CountryNotFoundError';
import { InvalidInvestmentError } from './errors/InvalidInvestmentError';

export class CalculateSimulationYields {
    constructor(private readonly countryRepository: CountryRepository) {}

    async execute(
        countryId: string,
        investmentAmount: number,
        themeMode: ThemeMode = 'dark',
    ): Promise<SimulationResults> {
        const country = await this.countryRepository.findById(CountryId(countryId));

        if (country === null) {
            throw new CountryNotFoundError(countryId);
        }

        const maxAllowed = country.targetBudget.amount * MAX_FUNDING_PROGRESS_RATIO;

        try {
            const investment = new InvestmentAmount(
                investmentAmount,
                country.targetBudget.currency,
                maxAllowed,
            );

            const simulation = new Simulation(country, investment, themeMode);

            return simulation.getResults();
        } catch (error) {
            if (error instanceof InvestmentExceedsMaxAllowedException) {
                throw new InvalidInvestmentError(
                    `Investment ${investmentAmount} exceeds maximum allowed ${maxAllowed} for country ${countryId}`,
                );
            }
            throw error;
        }
    }
}
