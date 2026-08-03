import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { MapColors } from '@/sovereign/domain/constants/MapColors';
import { Country } from '@/sovereign/domain/Country';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';
import {
    deferred,
    FRANCE,
    GERMANY,
    RESULTS,
} from '@/sovereign/infrastructure/ui/composables/useSimulationController.spec.helper';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.vue';
import { SettingsParseError } from './shared/errors/SettingsParseError.ts';
import { SettingsStorageError } from './shared/errors/SettingsStorageError.ts';
import ContextualSidebar from './sovereign/infrastructure/ui/components/ContextualSidebar.vue';

const findAllMock = vi.fn<() => Promise<Country[]>>();
const executeMock =
    vi.fn<(countryId: string, investmentAmount: number) => Promise<SimulationResults>>();

vi.mock('@/sovereign/infrastructure/adapters/StaticCountryRepository', () => ({
    StaticCountryRepository: vi.fn().mockImplementation(function () {
        return { findAll: findAllMock };
    }),
}));

vi.mock('@/sovereign/app/CalculateSimulationYields', () => ({
    CalculateSimulationYields: vi.fn().mockImplementation(function () {
        return { execute: executeMock };
    }),
}));

describe('App', () => {
    beforeEach(() => {
        findAllMock.mockReset();
        executeMock.mockReset();
    });

    it('loads countries and renders the map with computed results', async () => {
        findAllMock.mockResolvedValue([GERMANY, FRANCE]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        expect(executeMock).toHaveBeenCalledWith(GERMANY.id, GERMANY.baselineInvestment);
        expect(executeMock).toHaveBeenCalledWith(FRANCE.id, FRANCE.baselineInvestment);

        const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
        expect(germanPath.attributes('fill')).toBe(MapColors.ORANGE);
    });

    it('skips a country whose simulation computation fails, without crashing the map', async () => {
        findAllMock.mockResolvedValue([GERMANY, FRANCE]);
        executeMock.mockImplementation(async (countryId) => {
            if (countryId === FRANCE.id) {
                throw new Error('investment exceeds max allowed');
            }
            return RESULTS;
        });

        const wrapper = mount(App);
        await flushPromises();

        const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
        const frenchPath = wrapper.find('path.country-path[data-country-id="250"]');
        expect(germanPath.attributes('fill')).toBe(MapColors.ORANGE);
        expect(frenchPath.attributes('fill')).toBe(MapColors.INACTIVE);
    });

    it('stops before computing results when loading countries fails', async () => {
        findAllMock.mockRejectedValue(new Error('network down'));

        mount(App);
        await flushPromises();

        expect(executeMock).not.toHaveBeenCalled();
    });

    it('displays error message when loading countries fails', async () => {
        findAllMock.mockRejectedValue(new Error('network down'));

        const wrapper = mount(App);
        await flushPromises();

        expect(wrapper.find('p[role="alert"]').exists()).toBe(true);
        expect(wrapper.find('p[role="alert"]').text()).toContain('network down');
    });

    it('selects a country when the map emits country-select', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
        await germanPath.trigger('click');
        await flushPromises();

        expect(germanPath.attributes('stroke')).toBe(MapColors.SELECTION);
    });

    it('does not render ContextualSidebar when no country is selected', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        const sidebar = wrapper.find('.contextual-sidebar');
        expect(sidebar.exists()).toBe(false);
    });

    it('renders ContextualSidebar with country data when a country is selected', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
        await germanPath.trigger('click');
        await flushPromises();

        const sidebar = wrapper.find('.contextual-sidebar');
        expect(sidebar.exists()).toBe(true);
        expect(sidebar.find('.empty-state').exists()).toBe(false);
        expect(sidebar.find('.country-header').exists()).toBe(true);
        expect(sidebar.find('.country-name').text()).toBe('Germany');
        expect(sidebar.find('.slider-section').exists()).toBe(true);
    });

    it('initializes slider to baseline investment when country is selected', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
        await germanPath.trigger('click');
        await flushPromises();

        const slider = wrapper.find('input[type="range"]');
        expect(slider.exists()).toBe(true);
        expect(Number(slider.attributes('value'))).toBe(GERMANY.baselineInvestment);
    });

    it('updates slider value when user interacts with the slider', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
        await germanPath.trigger('click');
        await flushPromises();

        const slider = wrapper.find('input[type="range"]');
        await slider.setValue(750);
        await flushPromises();

        expect(slider.attributes('value')).toBe('750');
    });

    it('recalculates the simulation for the new slider value', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
        await germanPath.trigger('click');
        await flushPromises();

        const updatedResults: SimulationResults = { ...RESULTS, additionalJobs: 4000 };
        executeMock.mockResolvedValue(updatedResults);

        const slider = wrapper.find('input[type="range"]');
        await slider.setValue(750);
        await flushPromises();

        expect(executeMock).toHaveBeenCalledWith(GERMANY.id, 750);
        const sidebarComponent = wrapper.findComponent(ContextualSidebar);
        expect(sidebarComponent.props('results')).toEqual(updatedResults);
    });

    it('keeps the slider interactive while the recalculation is pending', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
        await germanPath.trigger('click');
        await flushPromises();

        const { promise, resolve } = deferred<SimulationResults>();
        executeMock.mockReturnValue(promise);

        const slider = wrapper.find('input[type="range"]');
        await slider.setValue(750);
        await flushPromises();

        expect(wrapper.find('input[type="range"]').exists()).toBe(true);
        expect(wrapper.find('input[type="range"]').attributes('value')).toBe('750');

        resolve(RESULTS);
        await flushPromises();

        expect(wrapper.find('input[type="range"]').attributes('value')).toBe('750');
    });

    it('reverts the slider to its previous value when recalculation fails', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
        await germanPath.trigger('click');
        await flushPromises();

        executeMock.mockRejectedValueOnce(new Error('investment exceeds max allowed'));

        const slider = wrapper.find('input[type="range"]');
        await slider.setValue(750);
        await flushPromises();

        expect(slider.attributes('value')).toBe(String(GERMANY.baselineInvestment));
    });

    it('hides sidebar when deselecting a country', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        // Select Germany
        const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
        await germanPath.trigger('click');
        await flushPromises();

        expect(wrapper.find('.contextual-sidebar').exists()).toBe(true);

        // Click on ocean to deselect
        const oceanRect = wrapper.find('rect');
        await oceanRect.trigger('click');
        await flushPromises();

        expect(wrapper.find('.contextual-sidebar').exists()).toBe(false);
    });

    it('defaults to dark theme when no localStorage value exists', async () => {
        localStorage.removeItem('gfi-dgms-settings');
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        expect(wrapper.find('.theme-dark').exists()).toBe(true);
    });

    it('loads theme from localStorage on mount', async () => {
        localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'light' }));
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        expect(wrapper.find('.theme-light').exists()).toBe(true);
    });

    it('persists theme change to localStorage', async () => {
        localStorage.removeItem('gfi-dgms-settings');
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mount(App);
        await flushPromises();

        const toggle = wrapper.find('.theme-toggle');
        await toggle.trigger('mouseenter');
        const options = wrapper.findAll('.theme-toggle-option');
        await options[2].trigger('click');

        const stored = JSON.parse(localStorage.getItem('gfi-dgms-settings') || '{}');
        expect(stored.themeMode).toBe('colorblind-light');
    });

    describe('settings persistence errors', () => {
        it('throws SettingsParseError when localStorage contains invalid JSON', async () => {
            localStorage.setItem('gfi-dgms-settings', '{invalid json}');
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            expect(() => mount(App)).toThrow(SettingsParseError);
        });

        it('throws SettingsStorageError when localStorage.getItem fails', async () => {
            const mockLocalStorage = {
                getItem: vi.fn(() => {
                    throw new Error('storage access denied');
                }),
                setItem: vi.fn(),
                removeItem: vi.fn(),
                clear: vi.fn(),
                get length() {
                    return 0;
                },
                key: vi.fn((_index: number) => null),
            };
            vi.stubGlobal('localStorage', mockLocalStorage);
            try {
                findAllMock.mockResolvedValue([GERMANY]);
                executeMock.mockResolvedValue(RESULTS);

                expect(() => mount(App)).toThrow(SettingsStorageError);
                expect(mockLocalStorage.getItem).toHaveBeenCalledWith('gfi-dgms-settings');
            } finally {
                vi.unstubAllGlobals();
            }
        });

        it('propagates SettingsStorageError when localStorage.setItem fails', async () => {
            const fakeStorage: Record<string, string> = {};
            const mockLocalStorage = {
                getItem: vi.fn((key: string) => fakeStorage[key] ?? null),
                setItem: vi.fn(() => {
                    throw new Error('storage quota exceeded');
                }),
                removeItem: vi.fn((key: string) => {
                    delete fakeStorage[key];
                }),
                clear: vi.fn(() => {
                    Object.keys(fakeStorage).forEach((k) => delete fakeStorage[k]);
                }),
                get length() {
                    return Object.keys(fakeStorage).length;
                },
                key: vi.fn((_index: number) => null),
            };
            vi.stubGlobal('localStorage', mockLocalStorage);
            try {
                findAllMock.mockResolvedValue([GERMANY]);
                executeMock.mockResolvedValue(RESULTS);

                const capturedErrors: unknown[] = [];

                const wrapper = mount(App, {
                    global: {
                        config: {
                            errorHandler: (err: unknown) => {
                                capturedErrors.push(err);
                            },
                        },
                    },
                });
                await flushPromises();

                const toggle = wrapper.find('.theme-toggle');
                await toggle.trigger('mouseenter');
                const options = wrapper.findAll('.theme-toggle-option');
                await options[2].trigger('click');
                await flushPromises();

                expect(capturedErrors.length).toBeGreaterThan(0);
                const settingsStorageError = capturedErrors.find(
                    (e) => e instanceof SettingsStorageError,
                );
                expect(settingsStorageError).toBeInstanceOf(SettingsStorageError);
                expect(mockLocalStorage.setItem).toHaveBeenCalled();
            } finally {
                vi.unstubAllGlobals();
            }
        });
    });

    describe('theme prop', () => {
        it('uses the theme prop value when provided, overrides localStorage', async () => {
            localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'dark' }));
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mount(App, {
                props: { theme: 'light' },
            });
            await flushPromises();

            expect(wrapper.find('.theme-light').exists()).toBe(true);
            expect(wrapper.find('.theme-dark').exists()).toBe(false);
        });

        it('uses the theme prop value when provided, regardless of localStorage', async () => {
            localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'light' }));
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mount(App, {
                props: { theme: 'colorblind-dark' },
            });
            await flushPromises();

            expect(wrapper.find('.theme-colorblind-dark').exists()).toBe(true);
        });

        it('falls back to localStorage when theme prop is not provided', async () => {
            localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'light' }));
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mount(App);
            await flushPromises();

            expect(wrapper.find('.theme-light').exists()).toBe(true);
        });

        it('defaults to dark when neither theme prop nor localStorage is set', async () => {
            localStorage.removeItem('gfi-dgms-settings');
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mount(App);
            await flushPromises();

            expect(wrapper.find('.theme-dark').exists()).toBe(true);
        });

        it('still persists through localStorage when theme prop is used', async () => {
            localStorage.removeItem('gfi-dgms-settings');
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            mount(App, {
                props: { theme: 'colorblind-light' },
            });
            await flushPromises();

            const stored = JSON.parse(localStorage.getItem('gfi-dgms-settings') || '{}');
            expect(stored.themeMode).toBe('colorblind-light');
        });

        it('falls back to settings when theme prop has an invalid runtime value', async () => {
            localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'light' }));
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mount(App, {
                props: { theme: 'invalid-theme' as unknown as ThemeMode },
            });
            await flushPromises();

            expect(wrapper.find('.theme-light').exists()).toBe(true);
            expect(wrapper.find('.theme-invalid-theme').exists()).toBe(false);
        });

        it('updates the UI when theme prop changes', async () => {
            localStorage.removeItem('gfi-dgms-settings');
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mount(App, {
                props: { theme: 'dark' },
            });
            await flushPromises();

            expect(wrapper.find('.theme-dark').exists()).toBe(true);

            await wrapper.setProps({ theme: 'light' });
            await flushPromises();

            expect(wrapper.find('.theme-dark').exists()).toBe(false);
            expect(wrapper.find('.theme-light').exists()).toBe(true);
        });

        it('passes theme mode to ContextualSidebar', async () => {
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mount(App, {
                props: { theme: 'light' },
            });
            await flushPromises();

            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('click');
            await flushPromises();

            const sidebar = wrapper.find('.contextual-sidebar');
            expect(sidebar.exists()).toBe(true);

            const sidebarComponent = wrapper.findComponent(ContextualSidebar);
            expect(sidebarComponent.props('themeMode')).toBe('light');
        });

        it('updates ContextualSidebar theme when theme prop changes', async () => {
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mount(App, {
                props: { theme: 'dark' },
            });
            await flushPromises();

            const germanPath = wrapper.find('path.country-path[data-country-id="276"]');
            await germanPath.trigger('click');
            await flushPromises();

            const sidebarComponent = wrapper.findComponent(ContextualSidebar);
            expect(sidebarComponent.props('themeMode')).toBe('dark');

            await wrapper.setProps({ theme: 'light' });
            await flushPromises();

            expect(sidebarComponent.props('themeMode')).toBe('light');
        });

        it('applies theme CSS variables to the app container', async () => {
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mount(App, {
                props: { theme: 'dark' },
            });
            await flushPromises();

            const appDiv = wrapper.find('.app');
            const style = appDiv.attributes('style');

            expect(style).toContain('--sidebar-bg');
            expect(style).toContain('--accent');
            expect(style).toContain('--progress-bg');
            expect(style).toContain('--error');
        });
    });
});
