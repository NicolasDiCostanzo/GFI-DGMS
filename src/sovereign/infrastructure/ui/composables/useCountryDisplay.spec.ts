import { MapColors } from '@/sovereign/domain/constants/MapColors';
import { describe, expect, it } from 'vitest';
import { ref } from 'vue';
import { useCountryDisplay } from './useCountryDisplay';
import { buildCountryFunding } from './useCountryDisplay.spec.fixtures';

describe('useCountryDisplay', () => {
    describe('hasCountryData', () => {
        it('returns true for a country with funding data', () => {
            const { hasCountryData } = useCountryDisplay(
                ref([buildCountryFunding('Germany', 1_000_000)]),
                ref('dark'),
            );

            expect(hasCountryData('Germany')).toBe(true);
        });

        it('returns false for a country with no funding data', () => {
            const { hasCountryData } = useCountryDisplay(ref([]), ref('dark'));

            expect(hasCountryData('France')).toBe(false);
        });
    });

    describe('getCountryFill', () => {
        it('returns the inactive color for a country with no data', () => {
            const { getCountryFill } = useCountryDisplay(ref([]), ref('dark'));

            expect(getCountryFill('France')).toBe(MapColors.INACTIVE);
        });

        it('returns the inactive color for a country with zero disclosed funding', () => {
            const { getCountryFill } = useCountryDisplay(
                ref([buildCountryFunding('France', 0)]),
                ref('dark'),
            );

            expect(getCountryFill('France')).toBe(MapColors.INACTIVE);
        });

        it('returns a funding-tier color for a country with disclosed funding', () => {
            const { getCountryFill } = useCountryDisplay(
                ref([buildCountryFunding('Germany', 1_000_000)]),
                ref('dark'),
            );

            expect(getCountryFill('Germany')).not.toBe(MapColors.INACTIVE);
        });
    });

    describe('getCountryAriaLabel / getTooltipText', () => {
        it('reports no disclosed funding for a country with none', () => {
            const { getCountryAriaLabel, getTooltipText } = useCountryDisplay(ref([]), ref('dark'));

            expect(getCountryAriaLabel('France')).toBe('France — no disclosed funding');
            expect(getTooltipText('France')).toBe('France — no disclosed funding');
        });

        it('reports the formatted total for a country with disclosed funding', () => {
            const { getCountryAriaLabel, getTooltipText } = useCountryDisplay(
                ref([buildCountryFunding('Germany', 5_000_000)]),
                ref('dark'),
            );

            expect(getCountryAriaLabel('Germany')).toBe('Germany — $5M tracked');
            expect(getTooltipText('Germany')).toBe('Germany — $5M tracked');
        });
    });
});
