import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { LEGEND_ITEMS } from './MapLegend.spec.fixtures';
import MapLegend from './MapLegend.vue';

describe('MapLegend', () => {
    it('renders the legend container with one item per entry', () => {
        const wrapper = mount(MapLegend, { props: { items: LEGEND_ITEMS } });
        expect(wrapper.find('.map-legend').exists()).toBe(true);
        expect(wrapper.findAll('.legend-item')).toHaveLength(LEGEND_ITEMS.length);
    });

    it('shows the label for each legend item', () => {
        const wrapper = mount(MapLegend, { props: { items: LEGEND_ITEMS } });
        const labels = wrapper.findAll('.legend-label').map((label) => label.text());
        expect(labels).toEqual(LEGEND_ITEMS.map((item) => item.label));
    });

    it('applies the item color to each legend swatch', () => {
        const wrapper = mount(MapLegend, { props: { items: LEGEND_ITEMS } });
        const swatches = wrapper
            .findAll('.legend-swatch')
            .map((swatch) => swatch.attributes('style'));
        expect(swatches).toEqual(LEGEND_ITEMS.map((item) => `background-color: ${item.color};`));
    });
});
