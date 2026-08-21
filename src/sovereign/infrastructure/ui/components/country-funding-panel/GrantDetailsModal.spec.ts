import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it } from 'vitest';
import { BASE_PROPS } from './GrantDetailsModal.spec.fixtures';
import GrantDetailsModal from './GrantDetailsModal.vue';

describe('GrantDetailsModal', () => {
    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('renders nothing in the document when closed', () => {
        mount(GrantDetailsModal, { props: { ...BASE_PROPS, open: false } });
        expect(document.body.querySelector('.grant-modal-overlay')).toBeNull();
    });

    it('teleports the open modal to document.body with the grant details', () => {
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });
        expect(wrapper.find('.grant-modal-overlay').exists()).toBe(false);

        const overlay = document.body.querySelector('.grant-modal-overlay');
        expect(overlay).not.toBeNull();
        expect(overlay!.textContent).toContain('Solar Grid Expansion');
        expect(overlay!.textContent).toContain('Green Energy Fund');
        expect(overlay!.textContent).toContain('Funding for renewable infrastructure upgrades.');

        const link = overlay!.querySelector('a.grant-modal-link');
        expect(link).not.toBeNull();
        expect(link!.getAttribute('href')).toBe('https://example.com/grant');
    });

    it('exposes the inner modal as a labelled dialog', () => {
        mount(GrantDetailsModal, { props: BASE_PROPS });

        const modal = document.body.querySelector('.grant-modal');
        const title = document.body.querySelector('.grant-modal-title');

        expect(modal?.getAttribute('role')).toBe('dialog');
        expect(modal?.getAttribute('aria-modal')).toBe('true');
        expect(title?.id).not.toBe('');
        expect(modal?.getAttribute('aria-labelledby')).toBe(title?.id);
    });

    it('moves focus into the dialog when open becomes true', async () => {
        const wrapper = mount(GrantDetailsModal, { props: { ...BASE_PROPS, open: false } });

        await wrapper.setProps({ open: true });

        expect(document.activeElement).toBe(document.body.querySelector('.grant-modal'));
    });

    it('restores focus to the previously focused element when the modal closes', async () => {
        const trigger = document.createElement('button');
        document.body.appendChild(trigger);
        trigger.focus();
        expect(document.activeElement).toBe(trigger);

        const wrapper = mount(GrantDetailsModal, { props: { ...BASE_PROPS, open: false } });

        await wrapper.setProps({ open: true });
        expect(document.activeElement).toBe(document.body.querySelector('.grant-modal'));

        await wrapper.setProps({ open: false });
        expect(document.activeElement).toBe(trigger);
    });

    it('restores nothing when the modal closes without a tracked trigger', async () => {
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });

        await wrapper.setProps({ open: false });

        expect(document.activeElement).toBe(document.body);
    });

    it('shows fallback text when funderName, description or sourceUrl are null', () => {
        mount(GrantDetailsModal, {
            props: { ...BASE_PROPS, funderName: null, description: null, sourceUrl: null },
        });

        const overlay = document.body.querySelector('.grant-modal-overlay');
        expect(overlay!.querySelectorAll('.grant-modal-no-url').length).toBe(1);
        expect(overlay!.textContent).toContain('Not specified');
    });

    it.each([['javascript:alert(1)'], ['data:text/html,<script>alert(1)</script>']])(
        'shows the "Not specified" fallback for unsafe sourceUrl scheme (%s)',
        (sourceUrl) => {
            mount(GrantDetailsModal, { props: { ...BASE_PROPS, sourceUrl } });

            const overlay = document.body.querySelector('.grant-modal-overlay');
            expect(overlay!.querySelectorAll('.grant-modal-link').length).toBe(0);
            expect(overlay!.querySelectorAll('.grant-modal-no-url').length).toBe(1);
            expect(overlay!.textContent).toContain(
                ' ✕ Solar Grid ExpansionGreen Energy FundFunding for renewable infrastructure upgrades.—',
            );
        },
    );

    it('emits close when the backdrop is clicked', async () => {
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });
        const overlay = document.body.querySelector('.grant-modal-overlay') as HTMLElement;
        overlay.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('close')).toHaveLength(1);
    });

    it('does not emit close when the modal content itself is clicked', async () => {
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });
        const content = document.body.querySelector('.grant-modal') as HTMLElement;
        content.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        await wrapper.vm.$nextTick();

        expect(wrapper.emitted('close')).toBeUndefined();
    });

    it('emits close when the close button is clicked', async () => {
        const wrapper = mount(GrantDetailsModal, { props: BASE_PROPS });
        const closeButton = document.body.querySelector('.grant-modal-close-button') as HTMLElement;
        closeButton.dispatchEvent(new MouseEvent('click', { bubbles: true }));
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

    it.each([['light'], ['dark'], ['colorblind-light'], ['colorblind-dark']] as const)(
        'computes its own theme colors for %s mode instead of inheriting them',
        (themeMode) => {
            mount(GrantDetailsModal, { props: { ...BASE_PROPS, themeMode } });
            const overlay = document.body.querySelector('.grant-modal-overlay') as HTMLElement;
            const colors = getThemeColors(themeMode);

            expect(overlay.getAttribute('style')).toContain(`--sidebar-bg: ${colors.SIDEBAR_BG}`);
            expect(overlay.getAttribute('style')).toContain(`--text: ${colors.TEXT}`);
        },
    );
});
