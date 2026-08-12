import { describe, expect, it } from 'vitest';
import { buildCountryFunding, createWrapper } from './EuAmbitionDial.spec.fixtures';

describe('EuAmbitionDial', () => {
    describe('default state', () => {
        it('shows the "Today" figures with no data', () => {
            const wrapper = createWrapper();

            expect(wrapper.find('.figure-value').text()).toBe('$0M');
            expect(wrapper.find('.figure-label').text()).toBe(
                'total public R&I funding tracked across the EU',
            );
        });

        it('marks the "Today" button as pressed', () => {
            const wrapper = createWrapper();
            const todayButton = wrapper.findAll('.dial-stop')[0];

            expect(todayButton.attributes('aria-pressed')).toBe('true');
        });
    });

    describe('"Today" figures', () => {
        it('reflects the real EU funding total from the provided data', () => {
            const wrapper = createWrapper({
                countryFundings: [buildCountryFunding('France', 5_000_000)],
            });

            expect(wrapper.find('.figure-value').text()).toBe('$5M');
        });
    });

    describe('switching stops', () => {
        it('shows the Moderate Policy Support figures when selected', async () => {
            const wrapper = createWrapper();

            await wrapper.findAll('.dial-stop')[1].trigger('click');
            const text = wrapper.text();

            expect(text).toContain('€111bn/year GVA');
            expect(text).toContain('414,000 jobs');
            expect(text).toContain('€53bn domestic market, €60bn exports');
            expect(text).toContain('€1.4bn/year public investment needed');
            expect(text).toContain('Moderate Policy Support (2040)');
        });

        it('shows the High Ambition figures when selected', async () => {
            const wrapper = createWrapper();

            await wrapper.findAll('.dial-stop')[2].trigger('click');
            const text = wrapper.text();

            expect(text).toContain('€260bn/year GVA');
            expect(text).toContain('1,000,000 jobs');
            expect(text).toContain('€205bn domestic market, €128bn exports');
            expect(text).toContain('€5.4bn/year public investment needed');
        });

        it('marks the selected button as pressed and others as not pressed', async () => {
            const wrapper = createWrapper();
            const stops = wrapper.findAll('.dial-stop');

            await stops[1].trigger('click');

            expect(stops[0].attributes('aria-pressed')).toBe('false');
            expect(stops[1].attributes('aria-pressed')).toBe('true');
            expect(stops[2].attributes('aria-pressed')).toBe('false');
        });

        it('cites the source for a scenario figure', async () => {
            const wrapper = createWrapper();

            await wrapper.findAll('.dial-stop')[1].trigger('click');

            expect(wrapper.find('.figure-source').text()).toContain('Systemiq (2026)');
            expect(wrapper.find('.figure-source').text()).toContain('not derived from');
        });
    });

    describe('keyboard interaction', () => {
        it('moves to the next stop with ArrowRight', async () => {
            const wrapper = createWrapper();

            await wrapper.find('.dial-stops').trigger('keydown', { key: 'ArrowRight' });

            expect(wrapper.text()).toContain('€111bn/year GVA');
        });

        it('moves to the previous stop with ArrowLeft', async () => {
            const wrapper = createWrapper();

            await wrapper.findAll('.dial-stop')[1].trigger('click');
            await wrapper.find('.dial-stops').trigger('keydown', { key: 'ArrowLeft' });

            expect(wrapper.find('.figure-label').text()).toContain('total public R&I funding');
        });

        it('wraps from the last stop to the first with ArrowRight', async () => {
            const wrapper = createWrapper();

            await wrapper.findAll('.dial-stop')[2].trigger('click');
            await wrapper.find('.dial-stops').trigger('keydown', { key: 'ArrowRight' });

            expect(wrapper.find('.figure-label').text()).toContain('total public R&I funding');
        });

        it('jumps to the first stop with Home', async () => {
            const wrapper = createWrapper();

            await wrapper.findAll('.dial-stop')[2].trigger('click');
            await wrapper.find('.dial-stops').trigger('keydown', { key: 'Home' });

            expect(wrapper.find('.figure-label').text()).toContain('total public R&I funding');
        });

        it('jumps to the last stop with End', async () => {
            const wrapper = createWrapper();

            await wrapper.find('.dial-stops').trigger('keydown', { key: 'End' });

            expect(wrapper.text()).toContain('€260bn/year GVA');
        });
    });
});
