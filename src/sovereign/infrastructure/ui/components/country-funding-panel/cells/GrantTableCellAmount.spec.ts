import { makeEnrichedRow } from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTableRow.spec.fixtures';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GrantTableCellAmount from './GrantTableCellAmount.vue';

describe('GrantTableCellAmount', () => {
    it('renders the formatted funding amount', () => {
        const wrapper = mount(GrantTableCellAmount, {
            props: { row: makeEnrichedRow() },
        });

        expect(wrapper.get('.amount-cell').text()).toContain('1.5');
    });
});
