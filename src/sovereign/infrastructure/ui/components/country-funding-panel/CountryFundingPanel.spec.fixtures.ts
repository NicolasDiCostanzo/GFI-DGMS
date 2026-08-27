import { CountryFunding, CountryName } from '@/sovereign/domain/CountryFunding';
import { Grant, GrantId } from '@/sovereign/domain/Grant';
import { mount } from '@vue/test-utils';
import CountryFundingPanel from './CountryFundingPanel.vue';

export const GRANT_ONE = new Grant(
    GrantId('rec1'),
    CountryName('France'),
    'Scaling cultivated foie gras production',
    5_000_000,
    ['Bpifrance', 'European Commission'],
    'Bpifrance and the European Commission',
    'Gourmey',
    'Funding to scale up bioreactor capacity.',
    'Commercialization',
    'Business Grant',
    ['Cultivated'],
    ['2024', '2025'],
    'https://example.com/announcement-1',
);

export const GRANT_TWO = new Grant(
    GrantId('rec2'),
    CountryName('France'),
    'Early-stage precision fermentation research',
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

export const GRANT_THREE = new Grant(
    GrantId('rec3'),
    CountryName('France'),
    'Unsafe source URL grant',
    null,
    [],
    null,
    null,
    null,
    null,
    null,
    [],
    [],
    'javascript:alert(1)',
);

export const FRANCE_FUNDING = new CountryFunding(CountryName('France'), [GRANT_ONE, GRANT_TWO]);

export const FRANCE_FUNDING_WITH_UNSAFE_URL = new CountryFunding(CountryName('France'), [
    GRANT_ONE,
    GRANT_THREE,
]);

export const GRANT_WITH_LONG_DESCRIPTION = new Grant(
    GrantId('rec4'),
    CountryName('France'),
    'Long description grant',
    1_000_000,
    ['Funder'],
    'Funder Name',
    'Recipient',
    'This is a very long description that definitely exceeds one hundred and twenty characters so that it should be truncated and made expandable in the table view.',
    'Research & Development',
    'Research Grant',
    ['All'],
    ['2023'],
    'https://example.com/long',
);

export const FRANCE_FUNDING_WITH_LONG_DESCRIPTION = new CountryFunding(CountryName('France'), [
    GRANT_WITH_LONG_DESCRIPTION,
]);

export const GERMANY_FUNDING = new CountryFunding(CountryName('Germany'), []);

export const GRANT_GERMANY = new Grant(
    GrantId('rec5'),
    CountryName('Germany'),
    'Germany grant',
    1_000_000,
    ['Funder'],
    'Funder Name',
    'Recipient',
    'Description',
    'Commercialization',
    'Business Grant',
    ['Cultivated'],
    ['2024'],
    'https://example.com/germany',
);

export const GERMANY_FUNDING_WITH_GRANTS = new CountryFunding(CountryName('Germany'), [
    GRANT_GERMANY,
]);

export interface WrapperOptions {
    countryFunding?: CountryFunding | null;
}

export function createWrapper(options: WrapperOptions = {}) {
    return mount(CountryFundingPanel, {
        props: {
            countryFunding: options.countryFunding ?? null,
        },
    });
}
