import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Legend from './Legend.vue';

describe('Legend', () => {
    it('renders nothing when no aims or instruments are provided', () => {
        const wrapper = mount(Legend);
        expect(wrapper.find('.legend-container').exists()).toBe(false);
    });

    it('renders aims with shortLabel and falls back to label when shortLabel is falsy', () => {
        const aims = [
            {
                label: 'Research & Development',
                shortLabel: '',
                borderColor: '#000',
                backgroundColor: '#fff',
                textColor: '#000',
            },
            {
                label: 'Commercialization',
                shortLabel: 'Env',
                borderColor: '#111',
                backgroundColor: '#eee',
                textColor: '#111',
            },
        ];

        const wrapper = mount(Legend, { props: { aims } });

        const swatches = wrapper.findAll('.aim-legend .legend-swatch');
        expect(swatches).toHaveLength(2);
        expect(swatches.map((s) => s.text())).toEqual(['Research & Development', 'Env']);
    });

    it('renders instruments with their labels', () => {
        const instruments = [
            { family: 'research', color: '#a00', label: 'Research' },
            { family: 'business', color: '#0a0', label: 'Business' },
        ];

        const wrapper = mount(Legend, { props: { instruments } });

        const swatches = wrapper.findAll('.instrument-legend .legend-swatch');
        expect(swatches).toHaveLength(2);
        expect(swatches.map((s) => s.text())).toEqual(['Research', 'Business']);
    });

    it('renders both aims and instruments when both props are provided', () => {
        const aims = [
            {
                label: 'Research & Development',
                shortLabel: 'R&D',
                borderColor: '#000',
                backgroundColor: '#fff',
                textColor: '#000',
            },
        ];
        const instruments = [{ family: 'research', color: '#a00', label: 'Research' }];

        const wrapper = mount(Legend, { props: { aims, instruments } });

        expect(wrapper.find('.legend-container').exists()).toBe(true);
        expect(wrapper.findAll('.aim-legend .legend-swatch')).toHaveLength(1);
        expect(wrapper.findAll('.instrument-legend .legend-swatch')).toHaveLength(1);
    });
});
