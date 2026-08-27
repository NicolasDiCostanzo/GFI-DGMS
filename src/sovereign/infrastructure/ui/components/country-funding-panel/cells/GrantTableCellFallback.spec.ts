import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GrantTableCellFallback from './GrantTableCellFallback.vue';

describe('GrantTableCellFallback', () => {
    it('renders a dash placeholder', () => {
        const wrapper = mount(GrantTableCellFallback);

        expect(wrapper.get('td').text()).toBe('—');
    });
});
