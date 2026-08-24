import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { resetTheme, useTheme } from '@/sovereign/infrastructure/ui/composables/useTheme';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import CountryFundingPanelCard from './CountryFundingPanelCard.vue';
import {
    basicGrant,
    customDefaultsGrant,
    invalidUrlGrant,
    longDescriptionGrant,
    makeGrant,
    multipleGrants,
    sampleColumnOrders,
} from './CountryFundingPanelTable.fixtures';
import CountryFundingPanelTable, { ColumnKey } from './CountryFundingPanelTable.vue';
import GrantDetailsModal from './GrantDetailsModal.vue';

describe('CountryFundingPanelTable', () => {
    beforeEach(() => {
        resetTheme();
    });

    it('renders rows for grants and shows link for valid URL', () => {
        const g1 = makeGrant({ id: 'g1', sourceUrl: 'https://example.com', amountUsd: 2_000_000 });
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [g1] },
        });

        expect(wrapper.findAll('tbody tr').length).toBe(1);
        const link = wrapper.find('a.grant-link');
        expect(link.exists()).toBe(true);
        expect(link.attributes('href')).toBe('https://example.com');
    });

    it('shows no-url placeholder when sourceUrl is invalid', () => {
        const g = invalidUrlGrant;
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [g] },
        });

        expect(wrapper.find('a.grant-link').exists()).toBe(false);
        expect(wrapper.find('.no-url').exists()).toBe(true);
    });

    it('shows a View details button for long descriptions that opens the details modal', async () => {
        const g = longDescriptionGrant;
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [g] },
        });

        const viewDetailsBtn = wrapper.find('button.description-toggle');
        expect(viewDetailsBtn.exists()).toBe(true);
        expect(viewDetailsBtn.text()).toMatch(/View details/i);

        expect(wrapper.findComponent(GrantDetailsModal).exists()).toBe(false);

        await viewDetailsBtn.trigger('click');
        const modal = wrapper.findComponent(GrantDetailsModal);
        expect(modal.exists()).toBe(true);
        expect(modal.props('open')).toBe(true);
        expect(modal.props('grant')).toEqual(g);

        await modal.vm.$emit('close');
        expect(wrapper.findComponent(GrantDetailsModal).exists()).toBe(false);
    });

    it('moves focus into the modal on open and restores it to the trigger on close', async () => {
        const g = longDescriptionGrant;
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [g] },
            attachTo: document.body,
        });

        const viewDetailsBtn = wrapper.find('button.description-toggle')
            .element as HTMLButtonElement;
        viewDetailsBtn.focus();
        expect(document.activeElement).toBe(viewDetailsBtn);

        await wrapper.find('button.description-toggle').trigger('click');
        expect(document.activeElement).toBe(document.body.querySelector('.grant-modal'));

        const closeButton = document.body.querySelector('.grant-modal-close-button') as HTMLElement;
        closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wrapper.vm.$nextTick();

        expect(wrapper.findComponent(GrantDetailsModal).exists()).toBe(false);
        expect(document.activeElement).toBe(viewDetailsBtn);

        wrapper.unmount();
    });

    it('always shows a View details button, even for a null description', () => {
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [basicGrant] },
        });

        expect(wrapper.find('button.description-toggle').exists()).toBe(true);
    });

    it('respects custom columnOrder prop', () => {
        const g = basicGrant;
        const wrapper = mount(CountryFundingPanelTable, {
            props: {
                grants: [g],
                columnOrder: ['projectTitle', 'url', 'amountUsd'],
            },
        });

        const headers = wrapper.findAll('thead th').map((h) => h.text());
        expect(headers[0]).toBe('Title');
        expect(headers[1]).toBe('URL');
        expect(headers[2]).toBe('Funding estimate');
    });

    it.each(sampleColumnOrders.map((order) => [order] as const))(
        'renders headers for sample column order %s',
        (order) => {
            const wrapper = mount(CountryFundingPanelTable, {
                props: {
                    grants: multipleGrants,
                    columnOrder: order as unknown as ReadonlyArray<ColumnKey>,
                },
            });
            const headers = wrapper.findAll('thead th').map((h) => h.text());
            expect(headers.length).toBe(order.length);
            expect(headers[0].length).toBeGreaterThan(0);
        },
    );

    it('renders fallback cell for unknown column keys', () => {
        const wrapper = mount(CountryFundingPanelTable, {
            props: {
                grants: [basicGrant],
                columnOrder: ['nonexistentKey'] as unknown as ReadonlyArray<ColumnKey>,
            },
        });
        const header = wrapper.find('thead th');
        expect(header.text()).toBe('nonexistentKey');
        const cell = wrapper.find('tbody td');
        expect(cell.text().trim()).toBe('—');
    });

    it('getCellValue returns strings for all known column keys', () => {
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [basicGrant] },
        });
        const egList = wrapper.vm.enrichedGrants;
        expect(egList.length).toBeGreaterThan(0);
        const eg = egList[0];
        const keys: ReadonlyArray<ColumnKey> = [
            'projectTitle',
            'recipients',
            'amountUsd',
            'funderName',
            'funderAgencies',
            'fundingInstrument',
            'platform',
            'yearsDisbursed',
            'description',
            'url',
        ];
        const { getCellValue } = wrapper.vm;
        for (const k of keys) {
            const v = getCellValue(k, eg);
            expect(typeof v).toBe('string');
        }
        expect(getCellValue('nonexistentKey' as unknown as ColumnKey, eg)).toBe('Not specified');
    });

    it('exposes columnLabels and includes amountUsd', () => {
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [basicGrant] },
        });
        const { columnLabels } = wrapper.vm;
        expect(columnLabels.amountUsd).toBe('Funding estimate');
    });

    it.each([['light'], ['dark'], ['colorblind-light'], ['colorblind-dark']] as const)(
        'renders instrument chip text color for %s theme',
        (themeMode) => {
            const { setTheme } = useTheme();
            setTheme(themeMode as ThemeMode);
            const g = makeGrant({ id: 'g-instrument', fundingInstrument: 'Research Grant' });
            const wrapper = mount(CountryFundingPanelTable, {
                props: { grants: [g] },
            });

            const instrument = wrapper.find('.instrument-chip');
            expect(instrument.exists()).toBe(true);
            const isDark = themeMode === 'dark' || themeMode === 'colorblind-dark';
            const expectedColor = getThemeColors(themeMode)[isDark ? 'ON_LIGHT' : 'ON_ACCENT'];
            expect(instrument.attributes('style')).toContain(`color: ${expectedColor}`);
        },
    );

    it('renders the aim-tinted row, instrument chip and platform segments when present', () => {
        const g = makeGrant({
            id: 'g-aim',
            aim: 'Research & Development',
            fundingInstrument: 'Research Grant',
            productionPlatforms: ['Plant-based'],
            funderAgencies: ['A1', 'A2'],
            yearsDisbursed: ['2020', '2021'],
        });
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [g] },
        });
        const row = wrapper.find('tbody tr');
        expect(row.exists()).toBe(true);
        const style = row.attributes('style') || '';
        expect(style).toMatch(/border-color|background-color/);

        const instrument = wrapper.find('.instrument-chip');
        expect(instrument.exists()).toBe(true);

        const segment = wrapper.find('.platform-segment');
        expect(segment.exists()).toBe(true);
    });

    it('shows Not specified for empty funderAgencies and formats years disbursed', () => {
        const g = makeGrant({ id: 'g-empty', funderAgencies: [], yearsDisbursed: ['2019'] });
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [g] },
        });
        const cells = wrapper.findAll('tbody td');
        const agenciesCell = cells.map((c) => c.text()).find((t) => t.includes('Not specified'));
        expect(agenciesCell).toBeDefined();
        expect(wrapper.text()).toContain('2019');
    });

    it('renders compact cards instead of the table when the view is narrow', async () => {
        vi.stubGlobal(
            'ResizeObserver',
            class {
                constructor(
                    private callback: (entries: Array<{ contentRect: { width: number } }>) => void,
                ) {}
                observe(): void {
                    this.callback([{ contentRect: { width: 400 } }]);
                }
                disconnect(): void {}
                unobserve(): void {}
            },
        );
        const g = makeGrant({
            id: 'g-card',
            aim: 'Research & Development',
            fundingInstrument: 'Research Grant',
            productionPlatforms: ['Plant-based'],
        });
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [g] },
        });
        await nextTick();

        expect(wrapper.find('.table-scroll-container').exists()).toBe(false);

        const cards = wrapper.findAllComponents(CountryFundingPanelCard);
        expect(cards).toHaveLength(1);

        const card = cards[0];
        const eg = wrapper.vm.enrichedGrants[0];
        expect(card.props('grant')).toEqual(g);
        expect(card.props('sourceUrl')).toBe(eg.sourceUrl);
        expect(card.props('aim')).toEqual(eg.aim);
        expect(card.props('instrument')).toEqual(eg.instrument);
        expect(card.props('segments')).toEqual(eg.segments);
        expect(card.props('instrumentTextColor')).toBe(wrapper.vm.instrumentTextColor);

        vi.unstubAllGlobals();
    });

    it('renders custom funderName and recipients overrides', () => {
        const wrapper = mount(CountryFundingPanelTable, {
            props: {
                grants: [customDefaultsGrant],
                columnOrder: ['funderName', 'recipients'] as unknown as ReadonlyArray<ColumnKey>,
            },
        });
        expect(wrapper.text()).toContain('Custom Funder');
        expect(wrapper.text()).toContain('Custom Recipient');
    });

    it.each([
        {
            name: 'single-year grants',
            grants: [
                makeGrant({ id: 'g-2025', projectTitle: 'Single 2025', yearsDisbursed: ['2025'] }),
                makeGrant({ id: 'g-2024', projectTitle: 'Single 2024', yearsDisbursed: ['2024'] }),
                makeGrant({ id: 'g-2026', projectTitle: 'Single 2026', yearsDisbursed: ['2026'] }),
            ],
        },
        {
            name: 'multi-year grants',
            grants: [
                makeGrant({
                    id: 'g-multi-3',
                    projectTitle: 'Ends 2023',
                    yearsDisbursed: ['2020', '2021', '2022', '2023'],
                }),
                makeGrant({
                    id: 'g-multi-5',
                    projectTitle: 'Ends 2025',
                    yearsDisbursed: ['2025', '2026'],
                }),
                makeGrant({
                    id: 'g-multi-4',
                    projectTitle: 'Ends 2024',
                    yearsDisbursed: ['2022', '2024'],
                }),
            ],
        },
        {
            name: 'mixed single- and multi-year grants',
            grants: [
                makeGrant({ id: 'g-2024', projectTitle: 'Single 2024', yearsDisbursed: ['2024'] }),
                makeGrant({
                    id: 'g-multi-2028',
                    projectTitle: 'Ends 2028',
                    yearsDisbursed: ['2026', '2027', '2028'],
                }),
                makeGrant({ id: 'g-2022', projectTitle: 'Single 2022', yearsDisbursed: ['2022'] }),
            ],
        },
    ])('sorts yearsDisbursed ascending by the last year granted ($name)', async ({ grants }) => {
        const wrapper = mount(CountryFundingPanelTable, {
            props: {
                grants,
                columnOrder: [
                    'yearsDisbursed',
                    'projectTitle',
                ] as unknown as ReadonlyArray<ColumnKey>,
            },
        });

        const yearsHeader = wrapper.findAll('thead th')[0];
        await yearsHeader.trigger('click');

        const rowTitles = wrapper.findAll('tbody tr .title-cell').map((cell) => cell.text());
        const expectedTitles = grants
            .slice()
            .sort(
                (a, b) =>
                    Math.max(...a.yearsDisbursed.map(Number)) -
                    Math.max(...b.yearsDisbursed.map(Number)),
            )
            .map((g) => g.projectTitle);
        expect(rowTitles).toEqual(expectedTitles);
    });

    it.each([
        {
            name: 'single-year grants',
            grants: [
                makeGrant({ id: 'g-2026', projectTitle: 'Single 2026', yearsDisbursed: ['2026'] }),
                makeGrant({ id: 'g-2024', projectTitle: 'Single 2024', yearsDisbursed: ['2024'] }),
                makeGrant({ id: 'g-2025', projectTitle: 'Single 2025', yearsDisbursed: ['2025'] }),
            ],
        },
        {
            name: 'multi-year grants',
            grants: [
                makeGrant({
                    id: 'g-multi-3',
                    projectTitle: 'Ends 2023',
                    yearsDisbursed: ['2020', '2021', '2022', '2023'],
                }),
                makeGrant({
                    id: 'g-multi-5',
                    projectTitle: 'Ends 2025',
                    yearsDisbursed: ['2025', '2026'],
                }),
                makeGrant({
                    id: 'g-multi-4',
                    projectTitle: 'Ends 2024',
                    yearsDisbursed: ['2022', '2024'],
                }),
            ],
        },
    ])('sorts yearsDisbursed descending by the last year granted ($name)', async ({ grants }) => {
        const wrapper = mount(CountryFundingPanelTable, {
            props: {
                grants,
                columnOrder: [
                    'yearsDisbursed',
                    'projectTitle',
                ] as unknown as ReadonlyArray<ColumnKey>,
            },
        });

        const yearsHeader = wrapper.findAll('thead th')[0];
        await yearsHeader.trigger('click');
        await yearsHeader.trigger('click');

        const rowTitles = wrapper.findAll('tbody tr .title-cell').map((cell) => cell.text());
        const expectedTitles = grants
            .slice()
            .sort(
                (a, b) =>
                    Math.max(...b.yearsDisbursed.map(Number)) -
                    Math.max(...a.yearsDisbursed.map(Number)),
            )
            .map((g) => g.projectTitle);
        expect(rowTitles).toEqual(expectedTitles);
    });

    it('treats grants without yearsDisbursed as having no last year when sorting', async () => {
        const grants = [
            makeGrant({ id: 'g-no-years', projectTitle: 'No years', yearsDisbursed: [] }),
            makeGrant({ id: 'g-2026', projectTitle: 'Ends 2026', yearsDisbursed: ['2026'] }),
            makeGrant({
                id: 'g-multi-2024',
                projectTitle: 'Ends 2024',
                yearsDisbursed: ['2022', '2023', '2024'],
            }),
        ];
        const wrapper = mount(CountryFundingPanelTable, {
            props: {
                grants,
                columnOrder: [
                    'yearsDisbursed',
                    'projectTitle',
                ] as unknown as ReadonlyArray<ColumnKey>,
            },
        });

        const yearsHeader = wrapper.findAll('thead th')[0];
        await yearsHeader.trigger('click');

        const rowTitles = wrapper.findAll('tbody tr .title-cell').map((cell) => cell.text());
        expect(rowTitles).toEqual(['No years', 'Ends 2024', 'Ends 2026']);
    });
});
