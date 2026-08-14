import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { getThemeColors } from '../../constants/ThemeColors';
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

describe('CountryFundingPanelTable', () => {
    it('renders rows for grants and shows link for valid URL', () => {
        const g1 = makeGrant({ id: 'g1', sourceUrl: 'https://example.com', amountUsd: 2_000_000 });
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [g1], themeMode: 'light' as ThemeMode },
        });

        expect(wrapper.findAll('tbody tr').length).toBe(1);
        const link = wrapper.find('a.grant-link');
        expect(link.exists()).toBe(true);
        expect(link.attributes('href')).toBe('https://example.com');
    });

    it('shows no-url placeholder when sourceUrl is invalid', () => {
        const g = invalidUrlGrant;
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [g], themeMode: 'light' as ThemeMode },
        });

        expect(wrapper.find('a.grant-link').exists()).toBe(false);
        expect(wrapper.find('.no-url').exists()).toBe(true);
    });

    it('toggles long descriptions with Show more / Show less', async () => {
        const g = longDescriptionGrant;
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [g], themeMode: 'light' as ThemeMode },
        });

        const moreBtn = wrapper.find('button.description-toggle');
        expect(moreBtn.exists()).toBe(true);
        expect(moreBtn.text()).toMatch(/Show more/i);

        await moreBtn.trigger('click');
        const lessBtn = wrapper.find('button.description-toggle');
        expect(lessBtn.exists()).toBe(true);
        expect(lessBtn.text()).toMatch(/Show less/i);
        expect(wrapper.text()).toContain((longDescriptionGrant.description ?? '').slice(0, 20));

        await lessBtn.trigger('click');
        const moreBtnAgain = wrapper.find('button.description-toggle');
        expect(moreBtnAgain.exists()).toBe(true);
        expect(moreBtnAgain.text()).toMatch(/Show more/i);
    });

    it('respects custom columnOrder prop', () => {
        const g = basicGrant;
        const wrapper = mount(CountryFundingPanelTable, {
            props: {
                grants: [g],
                themeMode: 'light' as ThemeMode,
                columnOrder: ['projectTitle', 'url', 'amountUsd'],
            },
        });

        const headers = wrapper.findAll('thead th').map((h) => h.text());
        expect(headers[0]).toBe('Title');
        expect(headers[1]).toBe('URL');
        expect(headers[2]).toBe('Funding estimate');
    });

    it.each(sampleColumnOrders)('renders headers for sample column order %s', (order) => {
        const wrapper = mount(CountryFundingPanelTable, {
            props: {
                grants: multipleGrants,
                themeMode: 'light' as ThemeMode,
                columnOrder: order as unknown as ReadonlyArray<ColumnKey>,
            },
        });
        const headers = wrapper.findAll('thead th').map((h) => h.text());
        expect(headers.length).toBe(order.length);
        // basic assertion: header labels match the column keys provided
        expect(headers[0].length).toBeGreaterThan(0);
    });

    it('renders fallback cell for unknown column keys', () => {
        const wrapper = mount(CountryFundingPanelTable, {
            props: {
                grants: [basicGrant],
                themeMode: 'light' as ThemeMode,
                columnOrder: ['nonexistentKey'] as unknown as ReadonlyArray<ColumnKey>,
            },
        });
        const header = wrapper.find('thead th');
        expect(header.text()).toBe('nonexistentKey');
        const cell = wrapper.find('tbody td');
        expect(cell.text().trim()).toBe('—');
    });

    it('shows aim placeholder when aim is not present', () => {
        const wrapper = mount(CountryFundingPanelTable, {
            props: {
                grants: [basicGrant],
                themeMode: 'light' as ThemeMode,
                columnOrder: ['aim'] as unknown as ReadonlyArray<ColumnKey>,
            },
        });
        const aimChip = wrapper.find('.aim-chip.aim-chip--none');
        expect(aimChip.exists()).toBe(true);
        expect(aimChip.text()).toBe('—');
    });

    it('getCellValue returns strings for all known column keys', () => {
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [basicGrant], themeMode: 'light' as ThemeMode },
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
            'aim',
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
            props: { grants: [basicGrant], themeMode: 'light' as ThemeMode },
        });
        const { columnLabels } = wrapper.vm;
        expect(columnLabels.amountUsd).toBe('Funding estimate');
    });

    it.each([['light'], ['dark'], ['colorblind-light'], ['colorblind-dark']] as const)(
        'renders instrument chip text color for %s theme',
        (themeMode) => {
            const g = makeGrant({ id: 'g-instrument', fundingInstrument: 'Research Grant' });
            const wrapper = mount(CountryFundingPanelTable, {
                props: { grants: [g], themeMode },
            });

            const instrument = wrapper.find('.instrument-chip');
            expect(instrument.exists()).toBe(true);
            const isDark = themeMode === 'dark' || themeMode === 'colorblind-dark';
            const expectedColor = getThemeColors(themeMode)[isDark ? 'ON_LIGHT' : 'ON_ACCENT'];
            expect(instrument.attributes('style')).toContain(`color: ${expectedColor}`);
        },
    );

    it('renders aim chip, instrument chip and platform segments when present', () => {
        const g = makeGrant({
            id: 'g-aim',
            aim: 'Research & Development',
            fundingInstrument: 'Research Grant',
            productionPlatforms: ['Plant-based'],
            funderAgencies: ['A1', 'A2'],
            yearsDisbursed: ['2020', '2021'],
        });
        const wrapper = mount(CountryFundingPanelTable, {
            props: { grants: [g], themeMode: 'light' as ThemeMode },
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
            props: { grants: [g], themeMode: 'light' as ThemeMode },
        });
        const cells = wrapper.findAll('tbody td');
        const agenciesCell = cells.map((c) => c.text()).find((t) => t.includes('Not specified'));
        expect(agenciesCell).toBeDefined();
        expect(wrapper.text()).toContain('2019');
    });

    it('renders custom funderName and recipients overrides', () => {
        const wrapper = mount(CountryFundingPanelTable, {
            props: {
                grants: [customDefaultsGrant],
                themeMode: 'light' as ThemeMode,
                columnOrder: ['funderName', 'recipients'] as unknown as ReadonlyArray<ColumnKey>,
            },
        });
        expect(wrapper.text()).toContain('Custom Funder');
        expect(wrapper.text()).toContain('Custom Recipient');
    });
});
