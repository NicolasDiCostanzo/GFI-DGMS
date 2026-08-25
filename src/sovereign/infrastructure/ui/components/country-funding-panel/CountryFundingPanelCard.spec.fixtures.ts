import { CountryName } from '@/sovereign/domain/CountryName';
import { Grant, GrantId } from '@/sovereign/domain/Grant';
import { getAimDisplay } from '@/sovereign/infrastructure/ui/constants/AimDisplay';
import { getFundingInstrumentDisplay } from '@/sovereign/infrastructure/ui/constants/FundingInstrumentDisplay';
import { getPlatformSegments } from '@/sovereign/infrastructure/ui/constants/ProductionPlatformSegments';
import { mount } from '@vue/test-utils';
import CountryFundingPanelCard from './CountryFundingPanelCard.vue';
import { makeGrant } from './CountryFundingPanelTable.fixtures';

export const THEME_MODE = 'light' as const;

export const NULL_FIELDS_GRANT = new Grant(
    GrantId('g-null'),
    CountryName('X'),
    null,
    null,
    [],
    null,
    null,
    null,
    null,
    null,
    [],
    [],
    null,
);

export function mountCardWithGrant(grant: Grant) {
    return mount(CountryFundingPanelCard, {
        props: {
            grant,
            sourceUrl: grant.sourceUrl,
            aim: getAimDisplay(grant.aim, THEME_MODE),
            instrument: getFundingInstrumentDisplay(grant.fundingInstrument, THEME_MODE),
            segments: getPlatformSegments(grant.productionPlatforms),
            instrumentTextColor: '#fff',
        },
    });
}

export function mountCard(overrides: Parameters<typeof makeGrant>[0] = {}) {
    return mountCardWithGrant(makeGrant(overrides));
}
