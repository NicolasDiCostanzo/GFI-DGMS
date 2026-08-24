import {
    makeEnrichedRow,
    platformSegments,
} from '@/sovereign/infrastructure/ui/components/country-funding-panel/GrantTableRow.spec.fixtures';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import GrantTableCellPlatform from './GrantTableCellPlatform.vue';

describe('GrantTableCellPlatform', () => {
    it('renders one segment per platform', () => {
        const wrapper = mount(GrantTableCellPlatform, {
            props: { row: makeEnrichedRow({ segments: platformSegments }) },
        });
        const segments = wrapper.findAll('.platform-segment');

        expect(segments.map((s) => s.text())).toEqual(platformSegments.map((s) => s.label));
    });

    it('renders no segments when there are none', () => {
        const wrapper = mount(GrantTableCellPlatform, {
            props: { row: makeEnrichedRow({ segments: null }) },
        });

        expect(wrapper.findAll('.platform-segment')).toHaveLength(0);
    });
});
