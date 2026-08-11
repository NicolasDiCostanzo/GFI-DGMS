import { describe, expect, it } from 'vitest';
import {
    createWrapper,
    FRANCE_FUNDING,
    GERMANY_FUNDING,
} from './CountryFundingPanel.spec.fixtures';

describe('CountryFundingPanel', () => {
    describe('with no countryFunding', () => {
        it('renders an empty country name and no grants', () => {
            const wrapper = createWrapper();

            expect(wrapper.find('.country-name').text()).toBe('');
            expect(wrapper.findAll('.grant-item')).toHaveLength(0);
        });

        it('does not render a projection section', () => {
            const wrapper = createWrapper();

            expect(wrapper.find('.projection-section').exists()).toBe(false);
        });
    });

    describe('country header and total', () => {
        it('displays the country name', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.find('.country-name').text()).toBe('France');
        });

        it('displays the total funding amount', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.find('.total-value').text()).toBe('$5M');
        });

        it('displays the disclosure note', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.find('.disclosure-note').text()).toBe(
                '1 of 2 grants have a disclosed amount',
            );
        });
    });

    describe('grant list', () => {
        it('renders one item per grant', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.findAll('.grant-item')).toHaveLength(2);
        });

        it('renders a fully populated grant', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const text = wrapper.findAll('.grant-item')[0].text();

            expect(text).toContain('Scaling cultivated foie gras production');
            expect(text).toContain('$5M');
            expect(text).toContain('Bpifrance, European Commission');
            expect(text).toContain('Bpifrance and the European Commission');
            expect(text).toContain('Gourmey');
            expect(text).toContain('Funding to scale up bioreactor capacity.');
            expect(text).toContain('Commercialization');
            expect(text).toContain('Cultivated');
            expect(text).toContain('2024, 2025');
        });

        it('links to the grant source URL when present', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const link = wrapper.findAll('.grant-item')[0].find('.grant-link');

            expect(link.attributes('href')).toBe('https://example.com/announcement-1');
        });

        it('renders defaults for a grant with no disclosed fields', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const text = wrapper.findAll('.grant-item')[1].text();

            expect(text).toContain('Undisclosed');
            expect(text).toContain('Not specified');
        });

        it('does not render a source link when the grant has none', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.findAll('.grant-item')[1].find('.grant-link').exists()).toBe(false);
        });
    });

    describe('2040 projection', () => {
        it('shows the published projection for a covered country', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.find('.projection-value').text()).toBe('€18bn/year GVA, 64,000 jobs');
        });

        it('does not show a projection for an uncovered country', () => {
            const wrapper = createWrapper({ countryFunding: GERMANY_FUNDING });

            expect(wrapper.find('.projection-section').exists()).toBe(false);
        });
    });

    describe('environmental impact panel', () => {
        it('passes the country funding grants through so the dominant pillar can be shown', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.find('.environmental-impact-panel').exists()).toBe(true);
            expect(wrapper.find('.panel-title').text()).toContain('cultivated meat');
        });

        it('renders nothing when the country has no grants', () => {
            const wrapper = createWrapper({ countryFunding: GERMANY_FUNDING });

            expect(wrapper.find('.environmental-impact-panel').exists()).toBe(false);
        });
    });

    describe('interaction', () => {
        it('emits close when the close button is clicked', async () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            await wrapper.find('.close-button').trigger('click');

            expect(wrapper.emitted('close')).toHaveLength(1);
        });
    });

    describe('data source attribution', () => {
        it('links to the Airtable tracker', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.find('.source-link').attributes('href')).toBe(
                'https://airtable.com/app9etL9LpZ9MKX3v/shr3Czph4N1AWaE18/tblxsTk9dw1Kq1qid',
            );
        });
    });
});
