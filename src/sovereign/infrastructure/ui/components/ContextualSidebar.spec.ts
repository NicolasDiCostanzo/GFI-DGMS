import { describe, expect, it } from 'vitest';
import { createWrapper, GERMANY, RESULTS, SLIDER_MAX } from './ContextualSidebar.spec.fixtures';

describe('ContextualSidebar', () => {
    describe('createWrapper fixture', () => {
        it('applies default values when no options provided', () => {
            const wrapper = createWrapper();
            expect(wrapper.props('country')).toBeNull();
            expect(wrapper.props('results')).toBeNull();
            expect(wrapper.props('sliderValue')).toBe(0);
            expect(wrapper.props('themeMode')).toBe('dark');
        });

        it('preserves explicitly provided null values', () => {
            const wrapper = createWrapper({
                country: null,
                results: null,
            });
            expect(wrapper.props('country')).toBeNull();
            expect(wrapper.props('results')).toBeNull();
        });
    });

    describe('country header', () => {
        it('displays the country flag and name', () => {
            const wrapper = createWrapper({ country: GERMANY });
            expect(wrapper.text()).toContain('🇩🇪Germany');
        });

        const INVESTMENT_FORMATS: ReadonlyArray<[number, string]> = [
            [500, '$500M'],
            [1500, '$1.5B'],
        ];

        it.each(INVESTMENT_FORMATS)(
            'displays current investment as %s when sliderValue is %s',
            (sliderValue, expected) => {
                const wrapper = createWrapper({ country: GERMANY, sliderValue });
                expect(wrapper.text()).toContain(expected);
            },
        );
    });

    describe('currency slider', () => {
        it('renders a range input', () => {
            const wrapper = createWrapper({ country: GERMANY });
            expect(wrapper.find('input[type="range"]').exists()).toBe(true);
        });

        const ARIA_ATTRS: ReadonlyArray<[string, string]> = [
            ['aria-label', 'Investment amount in USD'],
            ['aria-valuemin', '0'],
            ['aria-valuemax', String(SLIDER_MAX)],
        ];

        it.each(ARIA_ATTRS)('sets %s attribute', (attr, expected) => {
            const wrapper = createWrapper({ country: GERMANY });
            expect(wrapper.find('input[type="range"]').attributes(attr)).toBe(expected);
        });

        it('sets aria-valuenow to the current slider value', () => {
            const wrapper = createWrapper({ country: GERMANY, sliderValue: 750 });
            expect(wrapper.find('input[type="range"]').attributes('aria-valuenow')).toBe('750');
        });

        it('emits update:sliderValue when the slider changes', async () => {
            const wrapper = createWrapper({ country: GERMANY, sliderValue: 500 });
            await wrapper.find('input[type="range"]').setValue(750);
            expect(wrapper.emitted('update:sliderValue')).toHaveLength(1);
            expect(wrapper.emitted('update:sliderValue')![0]).toEqual([750]);
        });

        it('displays the current value above the thumb', () => {
            const wrapper = createWrapper({ country: GERMANY, sliderValue: 750 });
            expect(wrapper.text()).toContain('$750M');
        });

        const TRACK_LABELS = ['$0', 'Baseline ($500M)', 'Target ($1B)', '200% ($2B)'];

        it.each(TRACK_LABELS)('renders track label "%s"', (label) => {
            const wrapper = createWrapper({ country: GERMANY });
            const labels = wrapper.findAll('.slider-label');
            expect(labels.map((l) => l.text())).toContain(label);
        });
    });

    describe('progress ring', () => {
        it('renders an SVG circle', () => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            expect(wrapper.find('svg circle').exists()).toBe(true);
        });

        it('displays funding progress percentage as center text', () => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            expect(wrapper.text()).toContain('75%');
        });

        it('displays "of targeted funding" text', () => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            expect(wrapper.text()).toContain('of targeted funding');
        });

        const CIRCLE_ATTRS: ReadonlyArray<[string, string]> = [['stroke', RESULTS.colorHex]];

        it.each(CIRCLE_ATTRS)(
            'progress circle has %s matching results colorHex',
            (attr, expected) => {
                const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
                const circles = wrapper.findAll('svg circle');
                const progressCircle = circles[circles.length - 1];
                expect(progressCircle.attributes(attr)).toBe(expected);
            },
        );

        it('progress circle has stroke-dasharray and stroke-dashoffset attributes', () => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            const circles = wrapper.findAll('svg circle');
            const progressCircle = circles[circles.length - 1];
            expect(progressCircle.attributes('stroke-dasharray')).toBeTruthy();
            expect(progressCircle.attributes('stroke-dashoffset')).toBeTruthy();
        });
    });

    describe('economic indicator', () => {
        const ECONOMIC_TEXTS = [
            '12500',
            'people would be employed',
            '+2500',
            'Based on GFI economic projections',
        ];

        it.each(ECONOMIC_TEXTS)('displays "%s"', (text) => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            expect(wrapper.text()).toContain(text);
        });

        describe('at baseline', () => {
            const BASELINE_ECONOMIC_TEXTS = [
                '10000',
                'people are currently employed',
                'Based on GFI economic projections',
            ];

            it.each(BASELINE_ECONOMIC_TEXTS)('displays "%s"', (text) => {
                const wrapper = createWrapper({
                    country: GERMANY,
                    results: RESULTS,
                    sliderValue: GERMANY.baselineInvestment,
                });
                expect(wrapper.text()).toContain(text);
            });

            it('hides the jobs delta', () => {
                const wrapper = createWrapper({
                    country: GERMANY,
                    results: RESULTS,
                    sliderValue: GERMANY.baselineInvestment,
                });
                expect(wrapper.find('.economic-delta').text()).toBe('');
            });
        });
    });

    describe('climate indicator', () => {
        const CLIMATE_TEXTS = [
            '6250',
            'tonnes of CO₂ would be saved',
            '+1250',
            'Based on CE Delft LCA data',
        ];

        it.each(CLIMATE_TEXTS)('displays "%s"', (text) => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            expect(wrapper.text()).toContain(text);
        });

        describe('at baseline', () => {
            const BASELINE_CLIMATE_TEXTS = [
                '5000',
                'tonnes of CO₂ are currently saved',
                'Based on CE Delft LCA data',
            ];

            it.each(BASELINE_CLIMATE_TEXTS)('displays "%s"', (text) => {
                const wrapper = createWrapper({
                    country: GERMANY,
                    results: RESULTS,
                    sliderValue: GERMANY.baselineInvestment,
                });
                expect(wrapper.text()).toContain(text);
            });

            it('hides the CO₂ delta', () => {
                const wrapper = createWrapper({
                    country: GERMANY,
                    results: RESULTS,
                    sliderValue: GERMANY.baselineInvestment,
                });
                expect(wrapper.find('.climate-delta').text()).toBe('');
            });
        });
    });

    describe('accessibility', () => {
        it('slider has role="slider"', () => {
            const wrapper = createWrapper({ country: GERMANY });
            expect(wrapper.find('input[type="range"]').attributes('role')).toBe('slider');
        });

        it('progress ring has role="img" and aria-label', () => {
            const wrapper = createWrapper({ country: GERMANY, results: RESULTS });
            const svg = wrapper.find('.progress-ring-section').find('svg');
            expect(svg.attributes('role')).toBe('img');
            expect(svg.attributes('aria-label')).toContain('funding progress');
        });

        it('close button has aria-label for accessibility', () => {
            const wrapper = createWrapper({ country: GERMANY });
            const closeButton = wrapper.find('.close-button');
            expect(closeButton.exists()).toBe(true);
            expect(closeButton.attributes('aria-label')).toBe('Close sidebar');
        });

        it('emits close event when close button is clicked', async () => {
            const wrapper = createWrapper({ country: GERMANY });
            await wrapper.find('.close-button').trigger('click');
            expect(wrapper.emitted('close')).toHaveLength(1);
        });
    });
});
