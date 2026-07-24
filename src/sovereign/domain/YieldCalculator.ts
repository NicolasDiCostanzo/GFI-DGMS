import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { validateNumeric } from '@/shared/utils/validateNumeric';

export class YieldCalculator {

    static readonly #MAX_FUNDING_PROGRESS_RATIO = 2;

    static calculateFundingProgress(investment: number, target: number): number {
        validateNumeric(investment, 'YieldCalculator', 'investment');
        validateNumeric(target, 'YieldCalculator', 'target');
        if (target <= 0) {
            throw new NonPositiveNumberException('YieldCalculator target must be greater than 0');
        }

        const ratio = investment / target;

        if (ratio < 0) {
            return 0;
        }
        if (ratio > this.#MAX_FUNDING_PROGRESS_RATIO) {
            return this.#MAX_FUNDING_PROGRESS_RATIO;
        }
        return ratio;
    }

    static calculateAdditionalJobs(
        investment: number,
        baseline: number,
        multiplier: number,
    ): number {
        validateNumeric(investment, 'YieldCalculator', 'investment');
        validateNumeric(baseline, 'YieldCalculator', 'baseline');
        validateNumeric(multiplier, 'YieldCalculator', 'multiplier');

        return Math.round((investment - baseline) * multiplier);
    }

    static calculateAdditionalCO2(
        investment: number,
        baseline: number,
        multiplier: number,
    ): number {
        validateNumeric(investment, 'YieldCalculator', 'investment');
        validateNumeric(baseline, 'YieldCalculator', 'baseline');
        validateNumeric(multiplier, 'YieldCalculator', 'multiplier');

        return (investment - baseline) * multiplier;
    }
}