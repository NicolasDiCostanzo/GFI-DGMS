import { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { useTheme } from '@/sovereign/infrastructure/ui/composables/useTheme';
import { AIM_PALETTES, getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import {
    createWrapper,
    FRANCE_FUNDING,
    FRANCE_FUNDING_WITH_LONG_DESCRIPTION,
    FRANCE_FUNDING_WITH_UNSAFE_URL,
    GERMANY_FUNDING,
} from './CountryFundingPanel.spec.fixtures';
import GrantDetailsModal from './GrantDetailsModal.vue';

describe('CountryFundingPanel', () => {
    beforeEach(() => {
        useTheme().resetTheme();
    });
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

        it('displays the grant-count stat', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.find('.grant-count').text()).toBe('1/2 grants');
        });

        it('renders a centered summary header', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            const header = wrapper.find('.country-header');
            expect(header.classes()).toContain('summary-header');
            expect(wrapper.find('.country-name').text()).toBe('France');
            expect(wrapper.find('.total-value').text()).toBe('$5M');
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
            expect(text).toContain('CM');
            expect(text).toContain('2024, 2025');
        });

        it('renders the funding instrument chip with the cleaned label', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const row = wrapper.findAll('.grant-item')[0];

            expect(row.find('.instrument-chip').text()).toBe('Business Grant');
        });

        it('renders only the relevant production platform segment', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const row = wrapper.findAll('.grant-item')[0];
            const segments = row.findAll('.platform-segment');

            expect(segments.map((s) => s.text())).toEqual(['CM']);
            expect(segments[0].classes()).not.toContain('is-active');
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
            const { setTheme } = useTheme();
            setTheme('light');
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const row = wrapper.findAll('.grant-item')[0];
            const style = row.attributes('style') ?? '';
            const expected = AIM_PALETTES['Commercialization'].light;
            expect(style).toContain(`background-color: ${expected.backgroundColor}`);
            expect(style).toContain(`border-color: ${expected.borderColor}`);
        });

        it('tints the row with the dark aim palette in dark mode', () => {
            const { setTheme } = useTheme();
            setTheme('dark');
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const row = wrapper.findAll('.grant-item')[0];
            const style = row.attributes('style') ?? '';
            const expected = AIM_PALETTES['Commercialization'].dark;
            expect(style).toContain(`background-color: ${expected.backgroundColor}`);
            expect(style).toContain(`border-color: ${expected.borderColor}`);
        });
    });

    describe('description expansion', () => {
        it('shows a short description with a View details button', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const row = wrapper.findAll('.grant-item')[0];

            expect(row.find('.description-cell').text()).toContain(
                'Funding to scale up bioreactor capacity.',
            );
            expect(row.find('.description-toggle').exists()).toBe(true);
        });

        it('shows a truncated preview with a View details button for a long description', () => {
            const wrapper = createWrapper({
                countryFunding: FRANCE_FUNDING_WITH_LONG_DESCRIPTION,
            });
            const row = wrapper.findAll('.grant-item')[0];

            expect(row.find('.description-toggle').exists()).toBe(true);
            expect(row.find('.description-toggle').text()).toBe('View details');
        });

        it('opens the details modal with the full description when View details is clicked', async () => {
            const wrapper = createWrapper({
                countryFunding: FRANCE_FUNDING_WITH_LONG_DESCRIPTION,
            });
            const row = wrapper.findAll('.grant-item')[0];

            expect(wrapper.findComponent(GrantDetailsModal).exists()).toBe(false);

            await row.find('.description-toggle').trigger('click');

            const modal = wrapper.findComponent(GrantDetailsModal);
            expect(modal.exists()).toBe(true);
            expect(modal.props('open')).toBe(true);
            expect(modal.props('grant').description).toContain(
                'This is a very long description that definitely exceeds one hundred and twenty characters so that it should be truncated and made expandable in the table view.',
            );
        });

        it('closes the details modal when it emits close', async () => {
            const wrapper = createWrapper({
                countryFunding: FRANCE_FUNDING_WITH_LONG_DESCRIPTION,
            });
            const row = wrapper.findAll('.grant-item')[0];

            await row.find('.description-toggle').trigger('click');
            wrapper.findComponent(GrantDetailsModal).vm.$emit('close');
            await nextTick();

            expect(wrapper.findComponent(GrantDetailsModal).exists()).toBe(false);
        });

        it('shows Not specified with a View details button for a null description', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const row = wrapper.findAll('.grant-item')[1];

            expect(row.find('.description-cell').text()).toContain('Not specified');
            expect(row.find('.description-toggle').exists()).toBe(true);
        });
    });

    describe('legends', () => {
        it('labels the legends', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.find('.legend-label').text()).toContain('Legend:');
        });

        it("doesn't render the legend cards expanded by default", () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.find('.legend-label').attributes('aria-expanded')).toBe('false');
            expect(wrapper.findAll('.legend-card')).toHaveLength(0);
        });

        it('renders the legend cards when the label is clicked', async () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            await wrapper.find('.legend-label').trigger('click');

            expect(wrapper.find('.legend-label').attributes('aria-expanded')).toBe('true');
            expect(wrapper.findAll('.legend-card')).toHaveLength(2);
            const segments = wrapper.findAll('.legend-card .badge');

            expect(segments.map((s) => s.text())).toEqual(['PB', 'CM', 'FM']);

            const swatches = wrapper.findAll('.legend-card')[0]?.findAll('.legend-item') ?? [];

            expect(swatches).toHaveLength(3);
            expect(swatches.map((s) => s.text())).toEqual([
                'Research & Development',
                'Commercialization',
                'Mixed',
            ]);
        });

        it('re-collapse the legend cards when the label is clicked again', async () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            await wrapper.find('.legend-label').trigger('click');
            await wrapper.find('.legend-label').trigger('click');

            expect(wrapper.find('.legend-label').attributes('aria-expanded')).toBe('false');
            expect(wrapper.findAll('.legend-card')).toHaveLength(0);
        });

        it('does not render legends when there are no grants', () => {
            const wrapper = createWrapper({ countryFunding: GERMANY_FUNDING });

            expect(wrapper.find('.table-legends').exists()).toBe(false);
        });
    });

    describe('resizable sidebar width', () => {
        function mockContainerWidth(container: HTMLElement, width: number): void {
            vi.spyOn(container, 'getBoundingClientRect').mockReturnValue({
                width,
                right: width,
            } as DOMRect);
        }

        afterEach(() => {
            window.dispatchEvent(new MouseEvent('mouseup'));
            vi.restoreAllMocks();
        });

        it('renders a drag handle on the collapsed panel', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });

            expect(wrapper.find('.resize-handle').exists()).toBe(true);
            expect(wrapper.find('.resize-handle').attributes('aria-label')).toBe(
                'Resize panel width',
            );
        });

        it('computes the drag width from the panel container, not the browser window', async () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const container = wrapper.element.parentElement as HTMLElement;
            // Simulate an embed frame whose right edge sits well inside a wider window.
            mockContainerWidth(container, 500);

            await wrapper.find('.resize-handle').trigger('mousedown', { button: 0 });
            window.dispatchEvent(new MouseEvent('mousemove', { clientX: 400 }));
            await nextTick();

            expect(wrapper.find('.country-funding-panel').attributes('style')).toContain(
                'width: 320px',
            );
        });

        it('restores the default collapsed width when the panel is collapsed again', async () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const container = wrapper.element.parentElement as HTMLElement;
            mockContainerWidth(container, 1024);

            await wrapper.find('.resize-handle').trigger('mousedown', { button: 0 });
            window.dispatchEvent(new MouseEvent('mousemove', { clientX: 600 }));
            await wrapper.find('.expand-button').trigger('click');
            await wrapper.find('.expand-button').trigger('click');

            expect(wrapper.find('.country-funding-panel').attributes('style')).toContain(
                'width: 380px',
            );
        });

        it('treats a resize to the max width as an expanded panel', async () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const container = wrapper.element.parentElement as HTMLElement;
            mockContainerWidth(container, 1024);

            await wrapper.find('.resize-handle').trigger('mousedown', { button: 0 });
            window.dispatchEvent(new MouseEvent('mousemove', { clientX: 1 }));
            await nextTick();

            expect(wrapper.find('.country-funding-panel').classes()).toContain('is-expanded');
            expect(wrapper.find('.expand-button').attributes('aria-expanded')).toBe('true');
        });
    });

    describe('2040 projection', () => {
        it('shows the published projection for a covered country', () => {
            const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
            const values = wrapper.findAll('.projection-card .metric-value');

            expect(values.map((value) => value.text())).toEqual(['€18B', '64,000']);
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
                const { setTheme } = useTheme();
                setTheme(themeMode as ThemeMode);
                const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
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
                const { setTheme } = useTheme();
                setTheme(themeMode as ThemeMode);
                const wrapper = createWrapper({ countryFunding: FRANCE_FUNDING });
                const style = wrapper.find('.country-funding-panel').attributes('style');

                const colors = getThemeColors(themeMode as ThemeMode);
                expect(style).toContain(`--text: ${colors.TEXT}`);
                expect(style).toContain(`--link: ${colors.LINK}`);
            },
        );
    });
});
