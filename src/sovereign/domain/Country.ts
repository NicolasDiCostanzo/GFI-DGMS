import { TargetBudget } from './TargetBudget';

export type CountryId = string & { readonly _brand: 'CountryId' };
export const CountryId = (id: string): CountryId => id as CountryId;

export class Country {
    constructor(
        readonly id: CountryId,
        readonly name: string,
        readonly baselineInvestment: number,
        readonly targetBudget: TargetBudget,
        readonly jobMultiplier: number,
        readonly co2Multiplier: number,
        readonly currentNumberOfJobs: number,
        readonly currentCO2Saved: number,
    ) {}
}
