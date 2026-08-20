import type { CountryFunding } from '@/sovereign/domain/CountryFunding';
import { computed, type Ref } from 'vue';
import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { calculateFundingColorThresholds } from '@/sovereign/infrastructure/ui/utils/calculateFundingColorThresholds';
import { formatInvestment } from '@/sovereign/infrastructure/ui/utils/formatInvestment';
import { getColorForFundingAmount } from '@/sovereign/infrastructure/ui/utils/getColorForFundingAmount';

export function useCountryDisplay(
    countryFundings: Ref<readonly CountryFunding[]>,
    themeMode: Ref<ThemeMode>,
) {
    const fundingByName = computed(() => {
        const map = new Map<string, CountryFunding>();
        for (const funding of countryFundings.value) {
            map.set(funding.countryName, funding);
        }
        return map;
    });

    const thresholds = computed(() =>
        calculateFundingColorThresholds(
            countryFundings.value.map((funding) => funding.totalAmountUsd),
        ),
    );

    function getCountryFill(countryName: string): string {
        const funding = fundingByName.value.get(countryName);
        return getColorForFundingAmount(
            funding?.totalAmountUsd ?? 0,
            thresholds.value,
            themeMode.value,
        );
    }

    function getCountryAriaLabel(countryName: string): string {
        const funding = fundingByName.value.get(countryName);
        if (!funding || funding.totalAmountUsd <= 0) {
            return `${countryName} — no disclosed funding`;
        }
        return `${countryName} — ${formatInvestment(funding.totalAmountUsd / 1_000_000)} tracked`;
    }

    function getTooltipText(countryName: string): string {
        return getCountryAriaLabel(countryName);
    }

    function hasCountryData(countryName: string): boolean {
        return fundingByName.value.has(countryName);
    }

    return {
        getCountryFill,
        getCountryAriaLabel,
        getTooltipText,
        hasCountryData,
    };
}
