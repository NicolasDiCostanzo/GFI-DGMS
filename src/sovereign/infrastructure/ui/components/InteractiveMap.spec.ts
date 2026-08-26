import { CountryFunding } from '@/sovereign/domain/CountryFunding';
import { MapColors } from '@/sovereign/infrastructure/ui/constants/MapColors';
import { DARK_THEME_COLORS } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { mount } from '@vue/test-utils';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { nextTick } from 'vue';
import { createWrapperDefaults } from './InteractiveMap.spec.fixtures';
import InteractiveMap from './InteractiveMap.vue';

function dispatchWheel(
    element: Element,
    options: { deltaY: number; clientX: number; clientY: number },
): WheelEvent {
    const event = new WheelEvent('wheel', { ...options, cancelable: true, bubbles: true });
    element.dispatchEvent(event);
    return event;
}

type PointerEventType = 'pointerdown' | 'pointermove' | 'pointerup' | 'pointercancel';

function dispatchPointer(
    target: EventTarget,
    type: PointerEventType,
    options: {
        clientX: number;
        clientY: number;
        button?: number;
        pointerId?: number;
        pointerType?: string;
    },
): PointerEvent {
    const event = new PointerEvent(type, { ...options, cancelable: true, bubbles: true });
    target.dispatchEvent(event);
    return event;
}

function dispatchClick(
    target: EventTarget,
    options: { clientX: number; clientY: number; button?: number },
): MouseEvent {
    const event = new MouseEvent('click', { ...options, cancelable: true, bubbles: true });
    target.dispatchEvent(event);
    return event;
}

function createMockMediaQueryList(matches: boolean) {
    const listeners: Array<(event: Event) => void> = [];
    const mql = {
        matches,
        addEventListener: vi.fn((_type: string, listener: (event: Event) => void) => {
            listeners.push(listener);
        }),
        removeEventListener: vi.fn(),
    };
    return { mql, listeners };
}

function stubMatchMedia(mql: unknown) {
    Object.defineProperty(window, 'matchMedia', {
        value: vi.fn().mockReturnValue(mql),
        configurable: true,
        writable: true,
    });
}

async function createWrapper(
    options: {
        countryFundings?: readonly CountryFunding[];
        selectedCountryName?: string | null;
    } = {},
) {
    const defaults = createWrapperDefaults();
    const props = { ...defaults, ...options };

    return mount(InteractiveMap, {
        props: {
            countryFundings: props.countryFundings,
            selectedCountryName: props.selectedCountryName,
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
        it('fills a country with a funding-tier color when data exists', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            expect(germanPath.exists()).toBe(true);
            expect(germanPath.attributes('fill')).toBe(MapColors.NEON_GREEN);
        });

        it('fills a country with inactive colour when no funding data exists', async () => {
            const wrapper = await createWrapper({ countryFundings: [] });
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            expect(germanPath.attributes('fill')).toBe(MapColors.GREY);
        });
    });

    describe('selected country outline', () => {
        const originalMatchMedia = window.matchMedia;

        afterEach(() => {
            Object.defineProperty(window, 'matchMedia', {
                value: originalMatchMedia,
                configurable: true,
                writable: true,
            });
        });

        it('outlines the selected country on desktop', async () => {
            const { mql } = createMockMediaQueryList(false);
            stubMatchMedia(mql);

            const wrapper = await createWrapper({ selectedCountryName: 'Germany' });
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            expect(germanPath.attributes('stroke')).toBe(MapColors.BLUE);
            expect(germanPath.attributes('stroke-opacity')).toBe('1');
            expect(germanPath.attributes('stroke-width')).toBe('0.5');
        });

        it('does not outline the selected country on mobile', async () => {
            const { mql } = createMockMediaQueryList(true);
            stubMatchMedia(mql);

            const wrapper = await createWrapper({ selectedCountryName: 'Germany' });
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            expect(germanPath.attributes('stroke')).toBe(DARK_THEME_COLORS.BORDER);
            expect(germanPath.attributes('stroke-opacity')).toBe('0.35');
            expect(germanPath.attributes('stroke-width')).toBe('0.1');
        });
    });

    describe('country click events', () => {
        it('emits country-select with the country name on path click', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('click');
            expect(wrapper.emitted('country-select')).toHaveLength(1);
            expect(wrapper.emitted('country-select')![0]).toEqual(['Germany']);
        });

        it.each([
            { trigger: 'click' as const, description: 'click' },
            { trigger: 'keydown.enter' as const, description: 'Enter keydown' },
            { trigger: 'keydown.space' as const, description: 'Space keydown' },
        ])(
            'does not emit country-select on $description for a country without data',
            async ({ trigger }) => {
                const wrapper = await createWrapper();
                const frenchPath = wrapper.find('path.country-path[data-country-id="250"]');
                await frenchPath.trigger(trigger);
                expect(wrapper.emitted('country-select')).toBeUndefined();
            },
        );
    });

    describe('ocean click', () => {
        it('emits country-select with null when clicking the ocean background', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect');
            await oceanRect.trigger('click');
            expect(wrapper.emitted('country-select')).toHaveLength(1);
            expect(wrapper.emitted('country-select')![0]).toEqual([null]);
        });

        it('suppresses country-select when the click followed an ocean drag', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect').element;
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 100, clientY: 100, button: 0 });
            dispatchPointer(window, 'pointermove', { clientX: 150, clientY: 130, button: 0 });
            dispatchPointer(window, 'pointermove', { clientX: 160, clientY: 140, button: 0 });
            dispatchPointer(window, 'pointerup', { clientX: 160, clientY: 140, button: 0 });
            dispatchClick(oceanRect, { clientX: 160, clientY: 140, button: 0 });
            await nextTick();

            expect(wrapper.emitted('country-select')).toBeUndefined();

            dispatchClick(oceanRect, { clientX: 100, clientY: 100, button: 0 });
            await nextTick();

            expect(wrapper.emitted('country-select')).toHaveLength(1);
            expect(wrapper.emitted('country-select')![0]).toEqual([null]);
        });
    });

    describe('keyboard accessibility', () => {
        it('emits country-select with the country name on Enter keydown', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('keydown.enter');
            expect(wrapper.emitted('country-select')).toHaveLength(1);
            expect(wrapper.emitted('country-select')![0]).toEqual(['Germany']);
        });

        it('emits country-select with the country name on Space keydown', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('keydown.space');
            expect(wrapper.emitted('country-select')).toHaveLength(1);
            expect(wrapper.emitted('country-select')![0]).toEqual(['Germany']);
        });

        it('sets role="button" and tabindex="0" on countries with data', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            expect(germanPath.attributes('role')).toBe('button');
            expect(germanPath.attributes('tabindex')).toBe('0');
        });

        it('sets role="img" and excludes countries without data from the tab order', async () => {
            const wrapper = await createWrapper();
            const frenchPath = wrapper.find('path.country-path[data-country-id="250"]');
            expect(frenchPath.attributes('role')).toBe('img');
            expect(frenchPath.attributes('tabindex')).toBe('-1');
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

        it('includes the formatted funding total in aria-label when data exists', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            const ariaLabel = germanPath.attributes('aria-label');
            expect(ariaLabel).toContain('$5M');
        });

        it('includes "no disclosed funding" in aria-label when no results exist', async () => {
            const wrapper = await createWrapper({ countryFundings: [] });
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            const ariaLabel = germanPath.attributes('aria-label');
            expect(ariaLabel).toContain('no disclosed funding');
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

        it('shows "no disclosed funding" in the tooltip when no results exist for the country', async () => {
            const wrapper = await createWrapper({ countryFundings: [] });
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('mouseenter');
            const tooltip = wrapper.find('.map-tooltip');
            expect(tooltip.text()).toContain('no disclosed funding');
        });

        it('shows the country name from world-atlas in the tooltip for a country not in the funding list', async () => {
            const wrapper = await createWrapper();
            const frenchPath = wrapper.find('path.country-path[data-country-id="250"]');
            await frenchPath.trigger('mouseenter');
            const tooltip = wrapper.find('.map-tooltip');
            expect(tooltip.text()).toContain('France');
            expect(tooltip.text()).toContain('no disclosed funding');
        });

        it('hides tooltip div on mouseleave', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('mouseenter');
            await germanPath.trigger('mouseleave');
            expect(wrapper.find('.map-tooltip').exists()).toBe(false);
        });

        it('hides tooltip div on mouseleave', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('mouseenter');
            await germanPath.trigger('mouseleave');
            expect(wrapper.find('.map-tooltip').exists()).toBe(false);
        });

        it('hides tooltip div when a country is selected by click', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('mouseenter');
            await germanPath.trigger('click');
            expect(wrapper.find('.map-tooltip').exists()).toBe(false);
            expect(wrapper.emitted('country-select')).toHaveLength(1);
        });

        it('hides tooltip div when a country is selected via keyboard', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('focus');
            await germanPath.trigger('keydown.enter');
            expect(wrapper.find('.map-tooltip').exists()).toBe(false);
            expect(wrapper.emitted('country-select')).toHaveLength(1);
        });

        it('country path has clickable cursor', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            expect(germanPath.classes()).toContain('clickable');
        });

        it('country path without data does not have clickable cursor', async () => {
            const wrapper = await createWrapper();
            const frenchPath = wrapper.find('path.country-path[data-country-id="250"]');
            expect(frenchPath.classes()).not.toContain('clickable');
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
            const oceanRect = wrapper.find('rect').element;
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 100, clientY: 100, button: 0 });
            dispatchPointer(window, 'pointermove', { clientX: 150, clientY: 130, button: 0 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBe('translate(50,30) scale(1)');

            dispatchPointer(window, 'pointerup', { clientX: 150, clientY: 130, button: 0 });
        });

        it('pans the map on touch drag', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect').element;
            dispatchPointer(oceanRect, 'pointerdown', {
                clientX: 100,
                clientY: 100,
                button: 0,
                pointerType: 'touch',
            });
            dispatchPointer(window, 'pointermove', {
                clientX: 150,
                clientY: 130,
                button: 0,
                pointerType: 'touch',
            });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBe('translate(50,30) scale(1)');

            dispatchPointer(window, 'pointerup', {
                clientX: 150,
                clientY: 130,
                button: 0,
                pointerType: 'touch',
            });
        });

        it('pans the map on middle-button drag and prevents the default action', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect').element;
            const pointerDownEvent = dispatchPointer(oceanRect, 'pointerdown', {
                clientX: 100,
                clientY: 100,
                button: 1,
            });
            expect(pointerDownEvent.defaultPrevented).toBe(true);

            dispatchPointer(window, 'pointermove', { clientX: 130, clientY: 100, button: 1 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBe('translate(30,0) scale(1)');

            dispatchPointer(window, 'pointerup', { clientX: 130, clientY: 100, button: 1 });
        });

        it('does not start a drag for other mouse buttons', async () => {
            const wrapper = await createWrapper();
            const svgElement = wrapper.find('svg').element;
            dispatchPointer(svgElement, 'pointerdown', { clientX: 0, clientY: 0, button: 2 });
            dispatchPointer(window, 'pointermove', { clientX: 50, clientY: 30, button: 2 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBeFalsy();
        });

        it('does nothing when the svg has no screen CTM', async () => {
            const wrapper = await createWrapper();
            const svgElement = wrapper.find('svg').element as SVGSVGElement;
            svgElement.getScreenCTM = () => null;

            dispatchPointer(svgElement, 'pointerdown', { clientX: 0, clientY: 0, button: 0 });
            dispatchPointer(window, 'pointermove', { clientX: 50, clientY: 30, button: 0 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBeFalsy();
        });

        it('stops panning if the screen CTM becomes unavailable mid-drag', async () => {
            const wrapper = await createWrapper();
            const svgElement = wrapper.find('svg').element as SVGSVGElement;
            dispatchPointer(svgElement, 'pointerdown', { clientX: 0, clientY: 0, button: 0 });
            svgElement.getScreenCTM = () => null;

            dispatchPointer(window, 'pointermove', { clientX: 50, clientY: 30, button: 0 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBeFalsy();

            dispatchPointer(window, 'pointerup', { clientX: 50, clientY: 30, button: 0 });
        });

        it('ignores moves from another pointer while a drag is active', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect').element;
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 100, clientY: 100, pointerId: 1 });
            dispatchPointer(window, 'pointermove', { clientX: 150, clientY: 130, pointerId: 2 });
            await nextTick();

            const mapGroup = wrapper.find('.map-group');
            expect(mapGroup.attributes('transform')).toBeFalsy();

            dispatchPointer(window, 'pointermove', { clientX: 150, clientY: 130, pointerId: 1 });
            await nextTick();

            expect(mapGroup.attributes('transform')).toBe('translate(50,30) scale(1)');

            dispatchPointer(window, 'pointerup', { clientX: 150, clientY: 130, pointerId: 1 });
        });

        it('stops panning after pointercancel', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect').element;
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 100, clientY: 100, pointerId: 1 });
            dispatchPointer(window, 'pointercancel', { clientX: 120, clientY: 110, pointerId: 1 });

            dispatchPointer(window, 'pointermove', { clientX: 150, clientY: 130, pointerId: 1 });
            await nextTick();

            expect(wrapper.find('.map-group').attributes('transform')).toBeFalsy();
        });

        it('still selects the country on a plain click with no movement', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]').element;
            dispatchPointer(germanPath, 'pointerdown', { clientX: 100, clientY: 100, button: 0 });
            dispatchPointer(window, 'pointerup', { clientX: 100, clientY: 100, button: 0 });
            dispatchClick(germanPath, { clientX: 100, clientY: 100, button: 0 });
            await nextTick();

            expect(wrapper.emitted('country-select')).toHaveLength(1);
        });

        it('suppresses country-select when the click followed a drag', async () => {
            const wrapper = await createWrapper();
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]').element;
            dispatchPointer(germanPath, 'pointerdown', { clientX: 100, clientY: 100, button: 0 });
            dispatchPointer(window, 'pointermove', { clientX: 150, clientY: 100, button: 0 });
            dispatchPointer(window, 'pointermove', { clientX: 160, clientY: 100, button: 0 });
            dispatchPointer(window, 'pointerup', { clientX: 160, clientY: 100, button: 0 });
            dispatchClick(germanPath, { clientX: 160, clientY: 100, button: 0 });
            await nextTick();

            expect(wrapper.emitted('country-select')).toBeUndefined();

            dispatchClick(germanPath, { clientX: 150, clientY: 100, button: 0 });
            await nextTick();

            expect(wrapper.emitted('country-select')).toHaveLength(1);
        });

        it('removes the window pointer listeners added by an in-progress drag on unmount', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect').element;
            const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener');

            dispatchPointer(oceanRect, 'pointerdown', { clientX: 100, clientY: 100, button: 0 });
            wrapper.unmount();

            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                'pointermove',
                expect.any(Function),
            );
            expect(removeEventListenerSpy).toHaveBeenCalledWith('pointerup', expect.any(Function));
            expect(removeEventListenerSpy).toHaveBeenCalledWith(
                'pointercancel',
                expect.any(Function),
            );

            removeEventListenerSpy.mockRestore();
        });
    });

    describe('pinch to zoom', () => {
        it('zooms the map around the pinch midpoint', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect').element;
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 100, clientY: 100, pointerId: 1 });
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 200, clientY: 100, pointerId: 2 });

            dispatchPointer(window, 'pointermove', { clientX: 300, clientY: 100, pointerId: 2 });
            await nextTick();

            expect(wrapper.find('.map-group').attributes('transform')).toBe(
                'translate(-200,-100) scale(2)',
            );

            dispatchPointer(window, 'pointerup', { clientX: 300, clientY: 100, pointerId: 2 });
            dispatchPointer(window, 'pointermove', { clientX: 400, clientY: 400, pointerId: 1 });
            await nextTick();

            expect(wrapper.find('.map-group').attributes('transform')).toBe(
                'translate(-200,-100) scale(2)',
            );
        });

        it('ignores a third pointer while a pinch is active', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect').element;
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 100, clientY: 100, pointerId: 1 });
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 200, clientY: 100, pointerId: 2 });
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 400, clientY: 400, pointerId: 3 });

            dispatchPointer(window, 'pointermove', { clientX: 500, clientY: 500, pointerId: 3 });
            await nextTick();
            expect(wrapper.find('.map-group').attributes('transform')).toBeFalsy();

            dispatchPointer(window, 'pointermove', { clientX: 300, clientY: 100, pointerId: 2 });
            await nextTick();
            expect(wrapper.find('.map-group').attributes('transform')).toBe(
                'translate(-200,-100) scale(2)',
            );

            dispatchPointer(window, 'pointerup', { clientX: 300, clientY: 100, pointerId: 2 });
        });

        it('skips pinch zoom when the fingers share a starting point', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect').element;
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 100, clientY: 100, pointerId: 1 });
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 100, clientY: 100, pointerId: 2 });

            dispatchPointer(window, 'pointermove', { clientX: 130, clientY: 140, pointerId: 1 });
            await nextTick();

            expect(wrapper.find('.map-group').attributes('transform')).toBeFalsy();

            dispatchPointer(window, 'pointerup', { clientX: 130, clientY: 140, pointerId: 1 });
        });

        it('skips pinch zoom when the fingers collapse onto one point', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect').element;
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 100, clientY: 100, pointerId: 1 });
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 200, clientY: 100, pointerId: 2 });

            dispatchPointer(window, 'pointermove', { clientX: 150, clientY: 100, pointerId: 1 });
            await nextTick();
            expect(wrapper.find('.map-group').attributes('transform')).toBeFalsy();

            dispatchPointer(window, 'pointermove', { clientX: 150, clientY: 100, pointerId: 2 });
            await nextTick();
            expect(wrapper.find('.map-group').attributes('transform')).toBeFalsy();

            dispatchPointer(window, 'pointerup', { clientX: 150, clientY: 100, pointerId: 2 });
        });

        it('stops pinch zoom when the screen CTM becomes unavailable', async () => {
            const wrapper = await createWrapper();
            const mapGroupElement = wrapper.find('.map-group').element as SVGGElement;
            const oceanRect = wrapper.find('rect').element;
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 100, clientY: 100, pointerId: 1 });
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 200, clientY: 100, pointerId: 2 });
            mapGroupElement.getScreenCTM = () => null;

            dispatchPointer(window, 'pointermove', { clientX: 300, clientY: 100, pointerId: 2 });
            await nextTick();

            expect(wrapper.find('.map-group').attributes('transform')).toBeFalsy();

            dispatchPointer(window, 'pointerup', { clientX: 300, clientY: 100, pointerId: 2 });
        });

        it('suppresses country-select after a pinch gesture', async () => {
            const wrapper = await createWrapper();
            const oceanRect = wrapper.find('rect').element;
            const germanPath = wrapper.find('path.country-path[data-country-id="276"]').element;
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 100, clientY: 100, pointerId: 1 });
            dispatchPointer(oceanRect, 'pointerdown', { clientX: 200, clientY: 100, pointerId: 2 });
            dispatchPointer(window, 'pointermove', { clientX: 300, clientY: 100, pointerId: 2 });
            dispatchPointer(window, 'pointerup', { clientX: 300, clientY: 100, pointerId: 2 });
            dispatchPointer(window, 'pointerup', { clientX: 300, clientY: 100, pointerId: 1 });
            dispatchClick(germanPath, { clientX: 150, clientY: 100, button: 0 });
            await nextTick();

            expect(wrapper.emitted('country-select')).toBeUndefined();
        });
    });

    describe('legend', () => {
        it('renders a legend element', async () => {
            const wrapper = await createWrapper();
            const legend = wrapper.find('.map-legend');
            expect(legend.exists()).toBe(true);
        });

        it('legend shows legend-label elements for every bucket including "no data"', async () => {
            const wrapper = await createWrapper();
            const labels = wrapper.findAll('.legend-label');
            expect(labels.length).toBeGreaterThanOrEqual(6);
        });
    });
});
