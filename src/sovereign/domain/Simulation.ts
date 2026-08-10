import { getColorForFundingProgress, type ThemeMode } from './constants/MapColors';
import { Country } from './Country';
import { InvestmentAmount } from './InvestmentAmount';
import { SimulationResults } from './SimulationResults';
import { YieldCalculator } from './YieldCalculator';

export class Simulation {
    constructor(
        readonly country: Country,
        readonly investment: InvestmentAmount,
        private readonly themeMode: ThemeMode = 'dark',
    ) {}

    getResults(): SimulationResults {
        const fundingProgress = YieldCalculator.calculateFundingProgress(
            this.investment.value,
            this.country.targetBudget.amount,
        );

        return {
            fundingProgress,
            additionalJobs: YieldCalculator.calculateAdditionalJobs(
                this.investment.value,
                this.country.baselineInvestment,
                this.country.jobMultiplier,
            ),
            additionalCO2Tonnes: YieldCalculator.calculateAdditionalCO2(
                this.investment.value,
                this.country.baselineInvestment,
                this.country.co2Multiplier,
            ),
            colorHex: getColorForFundingProgress(fundingProgress, this.themeMode),
        };
    }
}
