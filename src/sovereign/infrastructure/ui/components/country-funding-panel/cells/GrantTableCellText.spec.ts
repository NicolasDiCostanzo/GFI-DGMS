import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GrantTableCellText from './GrantTableCellText.vue';

describe('GrantTableCellText', () => {
    it('renders the text clamped to two lines by default', () => {
        const wrapper = mount(GrantTableCellText, { props: { text: 'Some text' } });

        expect(wrapper.get('.clamped-text').text()).toBe('Some text');
        expect(wrapper.find('.single-line').exists()).toBe(false);
    });

    it('clamps to a single line when requested', () => {
        const wrapper = mount(GrantTableCellText, {
            props: { text: 'Some text', singleLine: true },
        });

        expect(wrapper.get('.clamped-text.single-line').text()).toBe('Some text');
    });
});
