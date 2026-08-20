import { AIM_PALETTES } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import Legend from './Legend.vue';

describe('Legend (module-initialized)', () => {
    it('renders the aim legend from the internal getAimLegend call', () => {
        const wrapper = mount(Legend);
        const swatches = wrapper.findAll('.legend-item');
        expect(swatches.length).toBeGreaterThan(0);
        const expectedBg = AIM_PALETTES['Research & Development'].dark.backgroundColor;
        expect(swatches[0]?.find('.color-bar').attributes('style')).toContain(expectedBg);
        const labels = swatches.map((s) => s.text());
        expect(labels).toContain('Research & Development');
        expect(labels).toContain('Commercialization');
        expect(labels).toContain('Mixed');
    });
});
