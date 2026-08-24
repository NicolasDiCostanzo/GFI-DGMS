import {
    makeEnrichedRow,
    makeGrantFor,
} from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTableRow.spec.fixtures';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GrantTableCellLink from './GrantTableCellLink.vue';

describe('GrantTableCellLink', () => {
    it('renders a link to the source URL', () => {
        const wrapper = mount(GrantTableCellLink, { props: { row: makeEnrichedRow() } });
        const link = wrapper.get('a.grant-link');

        expect(link.text()).toBe('View announcement');
        expect(link.attributes('href')).toBe('https://example.com/announcement');
        expect(link.attributes('rel')).toBe('noopener noreferrer');
    });

    it('renders a placeholder when there is no source URL', () => {
        const row = makeEnrichedRow({
            grant: makeGrantFor({ sourceUrl: null }),
            sourceUrl: null,
        });
        const wrapper = mount(GrantTableCellLink, { props: { row } });

        expect(wrapper.find('a.grant-link').exists()).toBe(false);
        expect(wrapper.get('.no-url').text()).toBe('—');
    });
});
