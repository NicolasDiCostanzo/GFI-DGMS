import {
    instrumentDisplay,
    makeEnrichedRow,
} from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTableRow.spec.fixtures';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GrantTableCellChip from './GrantTableCellChip.vue';

const TEXT_COLOR = 'rgb(255, 255, 255)';

describe('GrantTableCellChip', () => {
    it('renders the instrument label with the instrument and text colors', () => {
        const wrapper = mount(GrantTableCellChip, {
            props: {
                row: makeEnrichedRow(),
                instrumentTextColor: TEXT_COLOR,
            },
        });
        const chip = wrapper.get('.instrument-chip');

        expect(chip.text()).toBe(instrumentDisplay.label);
        expect(chip.attributes('style')).toContain(`background-color: ${instrumentDisplay.color}`);
        expect(chip.attributes('style')).toContain(`color: ${TEXT_COLOR}`);
    });
});
