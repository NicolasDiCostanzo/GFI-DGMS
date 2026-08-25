import { Grant } from '@/sovereign/domain/Grant';
import { resetTheme, useTheme } from '@/sovereign/infrastructure/ui/composables/useTheme';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { mount } from '@vue/test-utils';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { BASE_GRANT, BASE_PROPS } from './GrantDetailsModal.spec.fixtures';
import GrantDetailsModal from './GrantDetailsModal.vue';

describe('GrantDetailsModal', () => {
    beforeEach(() => {
        resetTheme();
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders nothing in the document when closed', () => {
        const wrapper = mount(GrantDetailsModal, { props: { ...BASE_PROPS, open: false } });
        expect(wrapper.find('.grant-modal-overlay').exists()).toBe(false);
    });

    it('renders the open modal with all grant details', () => {
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });
        const overlay = wrapper.find('.grant-modal-overlay');
        expect(overlay.exists()).toBe(true);
        expect(overlay.text()).toContain('Solar Grid Expansion');
        expect(overlay.text()).toContain('Green Energy Fund');
        expect(overlay.text()).toContain('Funding for renewable infrastructure upgrades.');
        expect(overlay.text()).toContain('France');
        expect(overlay.text()).toContain('Solar Grid Co.');
        expect(overlay.text()).toContain('$5M');
        expect(overlay.text()).toContain('Green Energy Agency');
        expect(overlay.text()).toContain('Business Grant');
        expect(overlay.text()).toContain('Commercialization');
        expect(overlay.text()).toContain(
            '✕ Solar Grid ExpansionCountryFranceRecipient(s)Solar Grid Co.Funding',
        );
        expect(overlay.text()).toContain('2024, 2025');

        const link = overlay.find('a.grant-modal-link');
        expect(link.exists()).toBe(true);
        expect(link.attributes('href')).toBe('https://example.com/grant');
    });

    it('exposes the inner modal as a labelled dialog', () => {
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });
        const modal = wrapper.find('.grant-modal');
        const title = wrapper.find('.grant-modal-title');

        expect(modal.attributes('role')).toBe('dialog');
        expect(modal.attributes('aria-modal')).toBe('true');
        expect(title.attributes('id')).not.toBe('');
        expect(modal.attributes('aria-labelledby')).toBe(title.attributes('id'));
    });

    it('moves focus into the dialog when open becomes true', async () => {
        const wrapper = mount(GrantDetailsModal, {
            props: { ...BASE_PROPS, open: false },
            attachTo: document.body,
        });

        await wrapper.setProps({ open: true });

        expect(document.activeElement).toBe(wrapper.find('.grant-modal').element);
    });

    it('restores focus to the previously focused element when the modal closes', async () => {
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        expect(document.activeElement).toBe(trigger);

        const wrapper = mount(GrantDetailsModal, {
            props: { ...BASE_PROPS, open: false },
            attachTo: document.body,
        });

        await wrapper.setProps({ open: true });
        expect(document.activeElement).toBe(wrapper.find('.grant-modal').element);

        await wrapper.setProps({ open: false });
        expect(document.activeElement).toBe(trigger);
    });

    it('restores nothing when the modal closes without a tracked trigger', async () => {
        const wrapper = mount(GrantDetailsModal, {
            props: BASE_PROPS,
            attachTo: document.body,
        });

        await wrapper.setProps({ open: false });

        expect(document.activeElement).toBe(document.body);
    });

    it('shows fallback text when grant fields are null', () => {
        const emptyGrant = new Grant(
            BASE_GRANT.id,
            BASE_GRANT.country,
            null,
            null,
            [],
            null,
            null,
            null,
            null,
            null,
            [],
            [],
            null,
        );
        const wrapper = mount(GrantDetailsModal, {
            props: { ...BASE_PROPS, grant: emptyGrant, sourceUrl: null },
        });
        const overlay = wrapper.find('.grant-modal-overlay');
        expect(overlay.findAll('.grant-modal-no-url')).toHaveLength(1);
        expect(overlay.text()).toContain('Not specified');
        expect(overlay.text()).toContain('Untitled grant');
        expect(overlay.text()).toContain('Undisclosed');
    });

    it.each([['javascript:alert(1)'], ['data:text/html,<script>alert(1)</script>']])(
        'shows the "Not specified" fallback for unsafe sourceUrl scheme (%s)',
        (sourceUrl) => {
            const wrapper = mount(GrantDetailsModal, { props: { ...BASE_PROPS, sourceUrl } });

            const overlay = wrapper.find('.grant-modal-overlay');
            expect(overlay.findAll('.grant-modal-link')).toHaveLength(0);
            expect(overlay.findAll('.grant-modal-no-url')).toHaveLength(1);
        },
    );

    it('binds the theme variables on the overlay so --modal-overlay resolves', () => {
        const { setTheme } = useTheme();
        setTheme('dark');
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });

        const colors = getThemeColors('dark');
        const overlayStyle = wrapper.find('.grant-modal-overlay').attributes('style');
        expect(overlayStyle).toContain(`--modal-overlay: ${colors.MODAL_OVERLAY}`);
        expect(overlayStyle).toContain(`--modal-shadow: ${colors.MODAL_SHADOW}`);
    });

    it.each([
        ['dark', true],
        ['light', false],
    ] as const)('uses the %s theme text color on the instrument chip', (mode, dark) => {
        const { setTheme } = useTheme();
        setTheme(mode);
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });

        const colors = getThemeColors(mode);
        const expected = dark ? colors.ON_LIGHT : colors.ON_ACCENT;
        expect(wrapper.find('.instrument-chip').attributes('style')).toContain(
            `color: ${expected}`,
        );
    });

    it('emits close when the backdrop is clicked', async () => {
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });
        await wrapper.find('.grant-modal-overlay').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('does not emit close when the modal content itself is clicked', async () => {
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });
        await wrapper.find('.grant-modal').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('close')).toBeUndefined();
    });

    it('emits close when the close button is clicked', async () => {
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });
        await wrapper.find('.grant-modal-close-button').trigger('click');
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('emits close when Escape is pressed while open', async () => {
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });
        window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('does not react to Escape once unmounted', async () => {
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });
        wrapper.unmount();

        expect(() =>
            window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' })),
        ).not.toThrow();
    });
});
