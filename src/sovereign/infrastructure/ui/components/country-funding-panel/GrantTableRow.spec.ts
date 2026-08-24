import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { GRANT_TABLE_COLUMN_ORDER, type GrantTableColumn } from './GrantTable.types';
import {
    aimDisplay,
    instrumentDisplay,
    makeEnrichedRow,
    makeGrantFor,
    platformSegments,
} from './GrantTableRow.spec.fixtures';
import GrantTableRow from './GrantTableRow.vue';

const INSTRUMENT_TEXT_COLOR = 'rgb(255, 255, 255)';

function mountRow(columns: ReadonlyArray<GrantTableColumn>, row = makeEnrichedRow()) {
    return mount(GrantTableRow, {
        props: { row, columns, instrumentTextColor: INSTRUMENT_TEXT_COLOR },
    });
}

describe('GrantTableRow', () => {
    it('renders one cell per column in the given order', () => {
        const wrapper = mountRow(GRANT_TABLE_COLUMN_ORDER);
        const cells = wrapper.findAll('td');

        expect(cells).toHaveLength(GRANT_TABLE_COLUMN_ORDER.length);
        expect(wrapper.find('.title-cell').text()).toBe('Row project');
        expect(wrapper.find('.amount-cell').text()).toContain('1.5');
        expect(wrapper.text()).toContain('Funder');
        expect(wrapper.text()).toContain('Recipient');
        expect(wrapper.text()).toContain('Agency A, Agency B');
        expect(wrapper.text()).toContain('2021, 2022');
        expect(wrapper.text()).toContain('Description text');
    });

    it.each([
        ['fundingInstrument', '.instrument-chip', 'Research Grant'],
        ['platform', '.platform-segment', null],
        ['url', '.grant-link', 'View announcement'],
        ['description', '.description-toggle', 'View details'],
    ] as const)('renders dedicated markup for %s columns', (column, selector, text) => {
        const row = makeEnrichedRow({ segments: platformSegments });
        const wrapper = mountRow([column], row);

        expect(wrapper.find(selector).exists()).toBe(true);
        if (text !== null) {
            expect(wrapper.find(selector).text()).toBe(text);
        }
    });

    it('styles the instrument chip with the instrument color and provided text color', () => {
        const wrapper = mountRow(['fundingInstrument']);
        const chip = wrapper.get('.instrument-chip');

        expect(chip.attributes('style')).toContain(`background-color: ${instrumentDisplay.color}`);
        expect(chip.attributes('style')).toContain(`color: ${INSTRUMENT_TEXT_COLOR}`);
    });

    it('renders no platform segments when segments are null', () => {
        const wrapper = mountRow(['platform']);

        expect(wrapper.find('.platform-segment').exists()).toBe(false);
    });

    it('renders a link to the source URL when valid', () => {
        const wrapper = mountRow(['url']);
        const link = wrapper.get('a.grant-link');

        expect(link.attributes('href')).toBe('https://example.com/announcement');
        expect(link.attributes('rel')).toBe('noopener noreferrer');
    });

    it('renders a placeholder when there is no source URL', () => {
        const row = makeEnrichedRow({
            grant: makeGrantFor({ sourceUrl: null }),
            sourceUrl: null,
        });
        const wrapper = mountRow(['url'], row);

        expect(wrapper.find('a.grant-link').exists()).toBe(false);
        expect(wrapper.get('.no-url').text()).toBe('—');
    });

    it('shows Not specified for empty funderAgencies and yearsDisbursed', () => {
        const row = makeEnrichedRow({
            grant: makeGrantFor({ funderAgencies: [], yearsDisbursed: [] }),
        });
        const wrapper = mountRow(['funderAgencies', 'yearsDisbursed'], row);
        const texts = wrapper.findAll('td').map((cell) => cell.text());

        expect(texts).toEqual(['Not specified', 'Not specified']);
    });

    it.each([
        ['projectTitle', 'Untitled grant'],
        ['recipients', 'Not specified'],
        ['funderName', 'Not specified'],
        ['description', 'Not specified'],
    ] as const)('shows a fallback for a null %s', (column, expected) => {
        const row = makeEnrichedRow({
            grant: makeGrantFor({ [column]: null }),
        });
        const wrapper = mountRow([column], row);

        expect(wrapper.get('td .clamped-text').text()).toBe(expected);
    });

    it('renders a dash for unknown column keys', () => {
        const wrapper = mountRow(['nonexistentKey' as GrantTableColumn]);

        expect(wrapper.get('td').text().trim()).toBe('—');
    });

    it('tints the row when an aim display is present', () => {
        const wrapper = mountRow(['projectTitle'], makeEnrichedRow({ aim: aimDisplay }));
        const style = wrapper.get('tr').attributes('style');

        expect(style).toContain(`background-color: ${aimDisplay.backgroundColor}`);
        expect(style).toContain(`border-color: ${aimDisplay.borderColor}`);
    });

    it('applies no inline style when there is no aim display', () => {
        const wrapper = mountRow(['projectTitle']);

        expect(wrapper.get('tr').attributes('style')).toBeUndefined();
    });

    it('emits open-details with the grant id when View details is clicked', async () => {
        const row = makeEnrichedRow();
        const wrapper = mountRow(['description'], row);

        await wrapper.get('.description-toggle').trigger('click');

        expect(wrapper.emitted('open-details')).toEqual([[row.grant.id]]);
    });
});
