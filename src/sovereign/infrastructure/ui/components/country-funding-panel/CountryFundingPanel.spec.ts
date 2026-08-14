import { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { describe, expect, it } from 'vitest';
import { AIM_PALETTES, getThemeColors } from '../../constants/ThemeColors';
import {
    createWrapper,
    FRANCE_FUNDING,
    FRANCE_FUNDING_WITH_LONG_DESCRIPTION,
    FRANCE_FUNDING_WITH_UNSAFE_URL,
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

        it('does not render a grant table', () => {
            const wrapper = createWrapper();

            expect(wrapper.find('.grant-table').exists()).toBe(false);
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

    describe('grant table', () => {
        it('renders one row per grant', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.findAll('.grant-item')).toHaveLength(2);
        });

        it('renders a fully populated grant row', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const text = wrapper.findAll('.grant-item')[0].text();

            expect(text).toContain('Scaling cultivated foie gras production');
            expect(text).toContain('$5M');
            expect(text).toContain('Bpifrance, European Commission');
            expect(text).toContain('Bpifrance and the European Commission');
            expect(text).toContain('Gourmey');
            expect(text).toContain('Funding to scale up bioreactor capacity.');
            expect(text).toContain('Comm.');
            expect(text).toContain('CM');
            expect(text).toContain('2024, 2025');
        });

        it('renders the funding instrument chip with the cleaned label', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const row = wrapper.findAll('.grant-item')[0];

            expect(row.find('.instrument-chip').text()).toBe('Business Grant');
        });

        it('renders the aim chip with the short label', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const row = wrapper.findAll('.grant-item')[0];

            expect(row.find('.aim-chip').text()).toBe('Comm.');
        });

        it('renders the production platform segments in PB, CM, FM order', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const row = wrapper.findAll('.grant-item')[0];
            const segments = row.findAll('.platform-segment');

            expect(segments.map((s) => s.text())).toEqual(['PB', 'CM', 'FM']);
            expect(segments[0].classes()).not.toContain('is-active');
            expect(segments[1].classes()).toContain('is-active');
            expect(segments[2].classes()).not.toContain('is-active');
        });

        it('renders defaults for a grant with no disclosed fields', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const text = wrapper.findAll('.grant-item')[1].text();

            expect(text).toContain('Undisclosed');
            expect(text).toContain('Not specified');
        });

        it('links to the grant source URL when present', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const link = wrapper.findAll('.grant-item')[0].find('.grant-link');

            expect(link.attributes('href')).toBe('https://example.com/announcement-1');
        });

        it('does not render a source link when the grant has none', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.findAll('.grant-item')[1].find('.grant-link').exists()).toBe(false);
        });

        it('does not render a source link for an unsafe scheme such as javascript:', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING_WITH_UNSAFE_URL });

            expect(wrapper.findAll('.grant-item')[1].find('.grant-link').exists()).toBe(false);
        });

        it('still renders the source link for a valid https URL alongside an unsafe one', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING_WITH_UNSAFE_URL });

            expect(wrapper.findAll('.grant-item')[0].find('.grant-link').attributes('href')).toBe(
                'https://example.com/announcement-1',
            );
        });
    });

    describe('aim row tinting', () => {
        it('tints the row with the light aim palette in light mode', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING, themeMode: 'light' });
            const row = wrapper.findAll('.grant-item')[0];
            const style = row.attributes('style') ?? '';
            const expected = AIM_PALETTES['Commercialization'].light;
            expect(style).toContain(`background-color: ${expected.backgroundColor}`);
            expect(style).toContain(`border-color: ${expected.borderColor}`);
        });

        it('tints the row with the dark aim palette in dark mode', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING, themeMode: 'dark' });
            const row = wrapper.findAll('.grant-item')[0];
            const style = row.attributes('style') ?? '';
            const expected = AIM_PALETTES['Commercialization'].dark;
            expect(style).toContain(`background-color: ${expected.backgroundColor}`);
            expect(style).toContain(`border-color: ${expected.borderColor}`);
        });
    });

    describe('description expansion', () => {
        it('shows a short description without a toggle', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const row = wrapper.findAll('.grant-item')[0];

            expect(row.find('.description-cell').text()).toContain(
                'Funding to scale up bioreactor capacity.',
            );
            expect(row.find('.description-toggle').exists()).toBe(false);
        });

        it('shows a truncated preview with a toggle for a long description', () => {
            const wrapper = createWrapper({
                countryFunding: FRANCE_FUNDING_WITH_LONG_DESCRIPTION,
            });
            const row = wrapper.findAll('.grant-item')[0];

            expect(row.find('.description-toggle').exists()).toBe(true);
            expect(row.find('.description-toggle').text()).toBe('Show more');
        });

        it('expands the description when the toggle is clicked', async () => {
            const wrapper = createWrapper({
                countryFunding: FRANCE_FUNDING_WITH_LONG_DESCRIPTION,
            });
            const row = wrapper.findAll('.grant-item')[0];

            await row.find('.description-toggle').trigger('click');

            expect(row.find('.description-cell').text()).toContain(
                'This is a very long description that definitely exceeds one hundred and twenty characters so that it should be truncated and made expandable in the table view.',
            );
            expect(row.find('.description-toggle').text()).toBe('Show less');
        });

        it('collapses the description when the toggle is clicked again', async () => {
            const wrapper = createWrapper({
                countryFunding: FRANCE_FUNDING_WITH_LONG_DESCRIPTION,
            });
            const row = wrapper.findAll('.grant-item')[0];

            await row.find('.description-toggle').trigger('click');
            await row.find('.description-toggle').trigger('click');

            expect(row.find('.description-toggle').text()).toBe('Show more');
        });

        it('shows Not specified for a null description without a toggle', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const row = wrapper.findAll('.grant-item')[1];

            expect(row.find('.description-cell').text()).toContain('Not specified');
            expect(row.find('.description-toggle').exists()).toBe(false);
        });
    });

    describe('legends', () => {
        it('renders an aim legend with one swatch per aim', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const swatches = wrapper.findAll('.aim-legend .legend-swatch');

            expect(swatches).toHaveLength(3);
            expect(swatches.map((s) => s.text())).toEqual([
                'Research & Development',
                'Commercialization',
                'Mixed',
            ]);
        });

        it('renders a production platform legend with the three segments', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const segments = wrapper.findAll('.platform-legend .platform-segment');

            expect(segments.map((s) => s.text())).toEqual([
                'PB = Plant-based',
                'CM = Cultivated',
                'FM = Fermentation',
            ]);
        });

        it('does not render legends when there are no grants', () => {
            const wrapper = createWrapper({ countryFunding: GERMANY_FUNDING });

            expect(wrapper.find('.table-legends').exists()).toBe(false);
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

    describe('expand/collapse', () => {
        it('renders an expand button that is collapsed by default', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            const expandButton = wrapper.find('.expand-button');
            expect(expandButton.exists()).toBe(true);
            expect(expandButton.attributes('aria-label')).toBe('Expand panel');
            expect(expandButton.attributes('aria-expanded')).toBe('false');
            expect(wrapper.find('.country-funding-panel.is-expanded').exists()).toBe(false);
        });

        it('expands the panel when the expand button is clicked', async () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            await wrapper.find('.expand-button').trigger('click');

            const panel = wrapper.find('.country-funding-panel');
            expect(panel.classes()).toContain('is-expanded');
            expect(wrapper.find('.expand-button').attributes('aria-expanded')).toBe('true');
            expect(wrapper.find('.expand-button').attributes('aria-label')).toBe('Restore panel');
        });

        it('collapses the panel when the expand button is clicked again', async () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            await wrapper.find('.expand-button').trigger('click');
            await wrapper.find('.expand-button').trigger('click');

            const panel = wrapper.find('.country-funding-panel');
            expect(panel.classes()).not.toContain('is-expanded');
            expect(wrapper.find('.expand-button').attributes('aria-expanded')).toBe('false');
            expect(wrapper.find('.expand-button').attributes('aria-label')).toBe('Expand panel');
        });

        it('emits close when the close button is clicked while expanded', async () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            await wrapper.find('.expand-button').trigger('click');
            await wrapper.find('.close-button').trigger('click');

            expect(wrapper.emitted('close')).toHaveLength(1);
        });

        it.each([['dark'], ['colorblind-dark'], ['light'], ['colorblind-light']] as const)(
            'still applies theme colors when expanded in %s mode',
            async (themeMode) => {
                const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING, themeMode });
                await wrapper.find('.expand-button').trigger('click');
                const style = wrapper.find('.country-funding-panel').attributes('style');
                const colors = getThemeColors(themeMode as ThemeMode);
                expect(style).toContain(`--text: ${colors.TEXT}`);
            },
        );
    });

    describe('data source attribution', () => {
        it('links to the Airtable tracker', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.find('.source-link').attributes('href')).toBe(
                'https://airtable.com/app9etL9LpZ9MKX3v/shr3Czph4N1AWaE18/tblxsTk9dw1Kq1qid',
            );
        });
    });

    describe('theme modes', () => {
        it.each([['dark'], ['colorblind-dark'], ['light'], ['colorblind-light']] as const)(
            'sets --text and --link for the %s theme',
            (themeMode) => {
                const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING, themeMode });
                const style = wrapper.find('.country-funding-panel').attributes('style');

                const colors = getThemeColors(themeMode as ThemeMode);
                expect(style).toContain(`--text: ${colors.TEXT}`);
                expect(style).toContain(`--link: ${colors.LINK}`);
            },
        );
    });
});
