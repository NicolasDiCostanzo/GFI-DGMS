import {
    makeEnrichedRow,
    makeGrantFor,
} from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTableRow.spec.fixtures';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GrantTableCellDescription from './GrantTableCellDescription.vue';

describe('GrantTableCellDescription', () => {
    it('renders the clamped description and a View details button', () => {
        const wrapper = mount(GrantTableCellDescription, {
            props: { row: makeEnrichedRow() },
        });

        expect(wrapper.get('.clamped-text').text()).toBe('Description text');
        expect(wrapper.get('.description-toggle').text()).toBe('View details');
    });

    it('shows Not specified when the description is null', () => {
        const wrapper = mount(GrantTableCellDescription, {
            props: { row: makeEnrichedRow({ grant: makeGrantFor({ description: null }) }) },
        });

        expect(wrapper.get('.clamped-text').text()).toBe('Not specified');
    });

    it('emits open-details with the grant id', async () => {
        const row = makeEnrichedRow();
        const wrapper = mount(GrantTableCellDescription, { props: { row } });

        await wrapper.get('.description-toggle').trigger('click');

        expect(wrapper.emitted('open-details')).toEqual([[row.grant.id]]);
    });
});
