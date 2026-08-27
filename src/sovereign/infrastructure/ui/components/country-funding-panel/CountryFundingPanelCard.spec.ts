import { getAimDisplay } from '@/sovereign/infrastructure/ui/constants/AimDisplay';
import { getFundingInstrumentDisplay } from '@/sovereign/infrastructure/ui/constants/FundingInstrumentDisplay';
import { describe, expect, it } from 'vitest';
import {
    mountCard,
    mountCardWithGrant,
    NULL_FIELDS_GRANT,
    THEME_MODE,
} from './CountryFundingPanelCard.spec.fixtures';

describe('CountryFundingPanelCard', () => {
    it('renders with makeGrant defaults when mounted without overrides', () => {
        const wrapper = mountCard();
        expect(wrapper.find('.grant-card-title').text()).toBe('Project');
    });

    it('renders the title and formatted amount in the header', () => {
        const wrapper = mountCard({ projectTitle: 'Solar Grid', amountUsd: 2_000_000 });
        expect(wrapper.find('.grant-card-title').text()).toBe('Solar Grid');
        expect(wrapper.find('.grant-card-amount').text()).toBe('$2M');
    });

    it('falls back to Untitled grant and Undisclosed for missing title/amount', () => {
        const wrapper = mountCardWithGrant(NULL_FIELDS_GRANT);
        expect(wrapper.find('.grant-card-title').text()).toBe('Untitled grant');
        expect(wrapper.find('.grant-card-amount').text()).toBe('Undisclosed');
    });

    it('renders the recipient in the subheader', () => {
        const wrapper = mountCard({ recipients: 'Acme Labs' });
        expect(wrapper.find('.grant-card-subheader').text()).toBe('Acme Labs');
    });

    it('renders the instrument chip with its label and color', () => {
        const wrapper = mountCard({ fundingInstrument: 'Research Grant' });
        const chip = wrapper.find('.instrument-chip');
        expect(chip.exists()).toBe(true);
        expect(chip.text()).toBe(getFundingInstrumentDisplay('Research Grant', THEME_MODE).label);
    });

    it('renders platform segments with active state', () => {
        const wrapper = mountCard({ productionPlatforms: ['Plant-based'] });
        const segments = wrapper.findAll('.platform-segment');
        expect(segments.length).toBe(1);
        expect(segments[0].text()).toBe('Plant-based');
        expect(segments[0].classes()).not.toContain('is-active');
    });

    it('renders no platform segments when none are present', () => {
        const wrapper = mountCard({ productionPlatforms: [] });
        expect(wrapper.findAll('.platform-segment').length).toBe(0);
    });

    it('applies the aim border-left color and background tint when an aim is present', () => {
        const wrapper = mountCard({ aim: 'Research & Development' });
        const aim = getAimDisplay('Research & Development', THEME_MODE)!;
        const style = wrapper.find('.grant-card').attributes('style');
        expect(style).toContain(`border-left-color: ${aim.borderColor}`);
        expect(style).toContain(`background-color: ${aim.backgroundColor}`);
    });

    it('does not set a border-left color or background tint when no aim is present', () => {
        const wrapper = mountCard({ aim: undefined });
        const style = wrapper.find('.grant-card').attributes('style') ?? '';
        expect(style).not.toContain('border-left-color');
        expect(style).not.toContain('background-color');
    });

    it('emits open-details when the trigger button is clicked', async () => {
        const wrapper = mountCard({
            funderName: 'Green Fund',
            description: 'Full description text',
            sourceUrl: 'https://example.com',
        });

        await wrapper.find('.grant-card-details-trigger').trigger('click');
        expect(wrapper.emitted('open-details')).toHaveLength(1);
    });
});
