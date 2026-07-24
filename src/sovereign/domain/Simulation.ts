import { getColorForFundingProgress } from './constants/MapColors';
import { Country } from './Country';
import { InvestmentAmount } from './InvestmentAmount';
import { SimulationResults } from './SimulationResults';
import { YieldCalculator } from './YieldCalculator';

export class Simulation {
    constructor(
        readonly country: Country,
        readonly investment: InvestmentAmount,
    ) {}

    getResults(): SimulationResults {
        const fundingProgress = YieldCalculator.calculateFundingProgress(
            this.investment.value,
            this.country.targetBudget.amount,
        );

        return {
            fundingProgress,
            additionalJobs: this.country.getAdditionalJobs(this.investment.value),
            additionalCO2Tonnes: this.country.getAdditionalCO2Saved(this.investment.value),
            isOverTarget: fundingProgress > 1.0,
            colorHex: getColorForFundingProgress(fundingProgress),
        };
    }
}
