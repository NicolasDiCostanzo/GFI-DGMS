import { DARK_THEME_COLORS, MapColors } from '@/sovereign/domain/constants/MapColors';
import { Country, CountryId } from '@/sovereign/domain/Country';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';
import { mount } from '@vue/test-utils';
import { describe, expect, it } from 'vitest';
import { nextTick } from 'vue';
import { createWrapperDefaults } from './InteractiveMap.spec.fixture';
import InteractiveMap from './InteractiveMap.vue';

function dispatchWheel(
    element: Element,
    options: { deltaY: number; clientX: number; clientY: number },
): WheelEvent {
    const event = new WheelEvent('wheel', { ...options, cancelable: true, bubbles: true });
    element.dispatchEvent(event);
    return event;
}

function dispatchMouse(
    target: EventTarget,
    type: 'mousedown' | 'mousemove' | 'mouseup' | 'click',
    options: { clientX: number; clientY: number; button?: number },
): MouseEvent {
    const event = new MouseEvent(type, { ...options, cancelable: true, bubbles: true });
    target.dispatchEvent(event);
    return event;
}

async function createWrapper(
    options: {
        countries?: Country[];
        resultsByCountry?: Map<CountryId, SimulationResults>;
        selectedCountryId?: CountryId | null;
        themeMode?: 'light' | 'dark' | 'colorblind-light' | 'colorblind-dark';
    } = {},
) {
    const defaults = createWrapperDefaults();
    const props = { ...defaults, ...options };

    return mount(InteractiveMap, {
        props: {
            countries: props.countries,
            resultsByCountry: props.resultsByCountry,
            selectedCountryId: props.selectedCountryId,
            themeMode: props.themeMode,
        },
    });
}

describe('InteractiveMap', () => {
    describe('SVG rendering', () => {
        it('renders an SVG element', async () => {
            const wrapper = await createWrapper();
            expect(wrapper.find('svg').exists()).toBe(true);
        });

        it('renders country path elements with country-path class', async () => {
            const wrapper = await createWrapper();
            const paths = wrapper.findAll('path.country-path');
            expect(paths.length).toBe(177);
        });

        it('each country path has a d attribute', async () => {
            const wrapper = await createWrapper();
            const paths = wrapper.findAll('path.country-path');
            for (const path of paths) {
                expect(path.attributes('d')).toBeTruthy();
            }
        });

        it('renders ocean background rectangle', async () => {
            const wrapper = await createWrapper();
            const rects = wrapper.findAll('rect');
            const oceanRect = rects.find((r) => r.attributes('fill') === DARK_THEME_COLORS.OCEAN);
            expect(oceanRect).toBeDefined();
        });
    });

    describe('country coloring', () => {
        it('fills a country with its simulation colorHex when data exists', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            expect(germanPath.exists()).toBe(true);
            expect(germanPath.attributes('fill')).toBe(MapColors.ORANGE);
        });

        it('fills a country with inactive colour when no simulation data exists', async () => {
            const wrapper = await createWrapper({
                resultsByCountry: new Map(),
            });
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            expect(germanPath.attributes('fill')).toBe(MapColors.INACTIVE);
        });
    });

    describe('country click events', () => {
        it('emits country-select with countryId on path click', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('click');
            expect(wrapper.emitted('country-select')).toHaveLength(1);
            expect(wrapper.emitted('country-select')![0]).toEqual(['276']);
        });
    });

    describe('ocean click', () => {
        it('emits country-select with null when clicking the ocean background', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect');
            await oceanRect.trigger('click');
            expect(wrapper.emitted('country-select')).toHaveLength(1);
            expect(wrapper.emitted('country-select')![0]).toEqual([null]);
        });
    });

    describe('keyboard accessibility', () => {
        it('emits country-select with countryId on Enter keydown', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('keydown.enter');
            expect(wrapper.emitted('country-select')).toHaveLength(1);
            expect(wrapper.emitted('country-select')![0]).toEqual(['276']);
        });

        it('emits country-select with countryId on Space keydown', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('keydown.space');
            expect(wrapper.emitted('country-select')).toHaveLength(1);
            expect(wrapper.emitted('country-select')![0]).toEqual(['276']);
        });

        it('shows tooltip div on focus', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('focus');
            const tooltip = wrapper.find('.map-tooltip');
            expect(tooltip.exists()).toBe(true);
            expect(tooltip.text()).toContain('Germany');
        });

        it('hides tooltip div on blur', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('focus');
            await germanPath.trigger('blur');
            expect(wrapper.find('.map-tooltip').exists()).toBe(false);
        });
    });

    describe('aria labels', () => {
        it('sets aria-label with country name on each country path', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            const ariaLabel = germanPath.attributes('aria-label');
            expect(ariaLabel).toContain('Germany');
        });

        it('includes funding progress in aria-label when data exists', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            const ariaLabel = germanPath.attributes('aria-label');
            expect(ariaLabel).toContain('75');
        });

        it('includes "no data" in aria-label when no results exist', async () => {
            const wrapper = await createWrapper({
                resultsByCountry: new Map(),
            });
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            const ariaLabel = germanPath.attributes('aria-label');
            expect(ariaLabel).toContain('no data');
        });
    });

    describe('hover interaction', () => {
        it('shows tooltip div on mouseenter', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('mouseenter');
            const tooltip = wrapper.find('.map-tooltip');
            expect(tooltip.exists()).toBe(true);
            expect(tooltip.text()).toContain('Germany');
        });

        it('shows "no data" in the tooltip when no results exist for the country', async () => {
            const wrapper = await createWrapper({ resultsByCountry: new Map() });
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('mouseenter');
            const tooltip = wrapper.find('.map-tooltip');
            expect(tooltip.text()).toContain('no data');
        });

        it('shows the country name from world-atlas in the tooltip for a country not in the countries list', async () => {
            const wrapper = await createWrapper();
            const frenchPath = wrapper.find('path.country-path[data-country-id="250"]');
            await frenchPath.trigger('mouseenter');
            const tooltip = wrapper.find('.map-tooltip');
            expect(tooltip.text()).toContain('France');
            expect(tooltip.text()).toContain('no data');
        });

        it('hides tooltip div on mouseleave', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('mouseenter');
            await germanPath.trigger('mouseleave');
            expect(wrapper.find('.map-tooltip').exists()).toBe(false);
        });

        it('country path has clickable cursor', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            expect(germanPath.classes()).toContain('clickable');
        });
    });

    describe('wheel zoom', () => {
        it('zooms in on wheel scroll up and prevents the page from scrolling', async () => {
            const wrapper = await createWrapper();
            const event = dispatchWheel(wrapper.find('svg').element, {
                deltaY: -100,
                clientX: 0,
                clientY: 0,
            });
            await nextTick();

            expect(event.defaultPrevented).toBe(true);
            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBe('translate(0,0) scale(1.25)');
        });

        it('zooms back out on wheel scroll down at the same point', async () => {
            const wrapper = await createWrapper();
            const svgElement = wrapper.find('svg').element;
            dispatchWheel(svgElement, { deltaY: -100, clientX: 0, clientY: 0 });
            await nextTick();
            dispatchWheel(svgElement, { deltaY: 100, clientX: 0, clientY: 0 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBeFalsy();
        });

        it('does not zoom out past the minimum scale', async () => {
            const wrapper = await createWrapper();
            dispatchWheel(wrapper.find('svg').element, { deltaY: 100, clientX: 0, clientY: 0 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBeFalsy();
        });

        it('does nothing when the map group has no screen CTM', async () => {
            const wrapper = await createWrapper();
            const mapGroupElement = wrapper.find('.map-group').element as SVGGElement;
            mapGroupElement.getScreenCTM = () => null;

            dispatchWheel(wrapper.find('svg').element, { deltaY: -100, clientX: 0, clientY: 0 });
            await nextTick();

            expect(mapGroupElement.getAttribute('transform')).toBeFalsy();
        });
    });

    describe('drag to pan', () => {
        it('pans the map on left-button drag', async () => {
            const wrapper = await createWrapper();
            const svgElement = wrapper.find('svg').element;
            dispatchMouse(svgElement, 'mousedown', { clientX: 0, clientY: 0, button: 0 });
            dispatchMouse(window, 'mousemove', { clientX: 50, clientY: 30, button: 0 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBe('translate(50,30) scale(1)');

            dispatchMouse(window, 'mouseup', { clientX: 50, clientY: 30, button: 0 });
        });

        it('pans the map on middle-button drag and prevents the default action', async () => {
            const wrapper = await createWrapper();
            const svgElement = wrapper.find('svg').element;
            const mousedownEvent = dispatchMouse(svgElement, 'mousedown', {
                clientX: 10,
                clientY: 10,
                button: 1,
            });
            expect(mousedownEvent.defaultPrevented).toBe(true);

            dispatchMouse(window, 'mousemove', { clientX: 40, clientY: 10, button: 1 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBe('translate(30,0) scale(1)');

            dispatchMouse(window, 'mouseup', { clientX: 40, clientY: 10, button: 1 });
        });

        it('does not start a drag for other mouse buttons', async () => {
            const wrapper = await createWrapper();
            const svgElement = wrapper.find('svg').element;
            dispatchMouse(svgElement, 'mousedown', { clientX: 0, clientY: 0, button: 2 });
            dispatchMouse(window, 'mousemove', { clientX: 50, clientY: 30, button: 2 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBeFalsy();
        });

        it('does nothing when the svg has no screen CTM', async () => {
            const wrapper = await createWrapper();
            const svgElement = wrapper.find('svg').element as SVGSVGElement;
            svgElement.getScreenCTM = () => null;

            dispatchMouse(svgElement, 'mousedown', { clientX: 0, clientY: 0, button: 0 });
            dispatchMouse(window, 'mousemove', { clientX: 50, clientY: 30, button: 0 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBeFalsy();
        });

        it('stops panning if the screen CTM becomes unavailable mid-drag', async () => {
            const wrapper = await createWrapper();
            const svgElement = wrapper.find('svg').element as SVGSVGElement;
            dispatchMouse(svgElement, 'mousedown', { clientX: 0, clientY: 0, button: 0 });
            svgElement.getScreenCTM = () => null;

            dispatchMouse(window, 'mousemove', { clientX: 50, clientY: 30, button: 0 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBeFalsy();

            dispatchMouse(window, 'mouseup', { clientX: 50, clientY: 30, button: 0 });
        });

        it('still selects the country on a plain click with no movement', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]').element;
            dispatchMouse(germanPath, 'mousedown', { clientX: 100, clientY: 100, button: 0 });
            dispatchMouse(window, 'mouseup', { clientX: 100, clientY: 100, button: 0 });
            dispatchMouse(germanPath, 'click', { clientX: 100, clientY: 100, button: 0 });
            await nextTick();

            expect(wrapper.emitted('country-select')).toHaveLength(1);
        });

        it('suppresses country-select when the click followed a drag', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]').element;
            dispatchMouse(germanPath, 'mousedown', { clientX: 100, clientY: 100, button: 0 });
            dispatchMouse(window, 'mousemove', { clientX: 150, clientY: 100, button: 0 });
            dispatchMouse(window, 'mousemove', { clientX: 160, clientY: 100, button: 0 });
            dispatchMouse(window, 'mouseup', { clientX: 160, clientY: 100, button: 0 });
            dispatchMouse(germanPath, 'click', { clientX: 160, clientY: 100, button: 0 });
            await nextTick();

            expect(wrapper.emitted('country-select')).toBeUndefined();

            dispatchMouse(germanPath, 'click', { clientX: 150, clientY: 100, button: 0 });
            await nextTick();

            expect(wrapper.emitted('country-select')).toHaveLength(1);
        });
    });

    describe('legend', () => {
        it('renders a legend element', async () => {
            const wrapper = await createWrapper();
            const legend = wrapper.find('.map-legend');
            expect(legend.exists()).toBe(true);
        });

        it('legend shows legend-label elements for gradient steps', async () => {
            const wrapper = await createWrapper();
            const labels = wrapper.findAll('.legend-label');
            expect(labels.length).toBeGreaterThanOrEqual(5);
        });
    });

    describe('responsive sizing', () => {
        it('svg has a viewBox attribute', async () => {
            const wrapper = await createWrapper();
            const svg = wrapper.find('svg');
            expect(svg.attributes('viewBox')).toBeTruthy();
        });
    });
});
