import type { CountryFunding } from '@/sovereign/domain/CountryFunding';
import type { Grant } from '@/sovereign/domain/Grant';
import { EU_MEMBER_COUNTRY_NAMES } from '@/sovereign/infrastructure/ui/constants/EuAmbitionScenarios';

export function calculateEuFundingTodayUsd(
    countryFundings: readonly CountryFunding[],
    unattributedGrants: readonly Grant[],
): number {
    const memberStatesTotal = countryFundings
        .filter((funding) => EU_MEMBER_COUNTRY_NAMES.includes(funding.countryName))
        .reduce((sum, funding) => sum + funding.totalAmountUsd, 0);

    const euLevelTotal = unattributedGrants
        .filter((grant) => grant.country === 'European Union')
        .reduce((sum, grant) => sum + (grant.amountUsd ?? 0), 0);

    return memberStatesTotal + euLevelTotal;
}
