import { NonPositiveNumberException } from '@/shared/errors/NonPositiveNumberException';
import { validateNumeric } from '@/shared/utils/validateNumeric';
import { MAX_FUNDING_PROGRESS_RATIO } from './constants/FundingConstants';

export class YieldCalculator {
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
        if (ratio > MAX_FUNDING_PROGRESS_RATIO) {
            return MAX_FUNDING_PROGRESS_RATIO;
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
