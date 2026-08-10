import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { Country } from '@/sovereign/domain/Country';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockLocalStorage, deferred, FRANCE, GERMANY, RESULTS } from './App.spec.fixture.ts';
import App from './App.vue';
import { SettingsParseError } from './shared/errors/SettingsParseError.ts';
import ContextualSidebar from './sovereign/infrastructure/ui/components/ContextualSidebar.vue';
import InteractiveMap from './sovereign/infrastructure/ui/components/InteractiveMap.vue';

const findAllMock = vi.fn<() => Promise<Country[]>>();
const executeMock =
    vi.fn<
        (
            countryId: string,
            investmentAmount: number,
            themeMode: ThemeMode,
        ) => Promise<SimulationResults>
    >();

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

function mountApp(options: Parameters<typeof mount<typeof App>>[1] = {}) {
    return mount(App, {
        ...options,
        global: {
            ...options.global,
            stubs: { InteractiveMap: true, ContextualSidebar: true },
        },
    });
}

describe('App', () => {
    beforeEach(() => {
        findAllMock.mockReset();
        executeMock.mockReset();
    });

    it('loads countries and passes computed results down to the map', async () => {
        findAllMock.mockResolvedValue([GERMANY, FRANCE]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
        await flushPromises();

        expect(executeMock).toHaveBeenCalledWith(GERMANY.id, GERMANY.baselineInvestment, 'dark');
        expect(executeMock).toHaveBeenCalledWith(FRANCE.id, FRANCE.baselineInvestment, 'dark');

        const resultsByCountry = wrapper.findComponent(InteractiveMap).props('resultsByCountry');
        expect(resultsByCountry.get(GERMANY.id)).toEqual(RESULTS);
        expect(resultsByCountry.get(FRANCE.id)).toEqual(RESULTS);
    });

    it('omits a country whose simulation computation failed, without crashing', async () => {
        findAllMock.mockResolvedValue([GERMANY, FRANCE]);
        executeMock.mockImplementation(async (countryId) => {
            if (countryId === FRANCE.id) {
                throw new Error('investment exceeds max allowed');
            }
            return RESULTS;
        });

        const wrapper = mountApp();
        await flushPromises();

        const resultsByCountry = wrapper.findComponent(InteractiveMap).props('resultsByCountry');
        expect(resultsByCountry.get(GERMANY.id)).toEqual(RESULTS);
        expect(resultsByCountry.has(FRANCE.id)).toBe(false);
    });

    it('renders ContextualSidebar with undefined results when the selected country has no computed results', async () => {
        findAllMock.mockResolvedValue([GERMANY, FRANCE]);
        executeMock.mockImplementation(async (countryId) => {
            if (countryId === FRANCE.id) {
                throw new Error('investment exceeds max allowed');
            }
            return RESULTS;
        });

        const wrapper = mountApp();
        await flushPromises();

        wrapper.findComponent(InteractiveMap).vm.$emit('country-select', FRANCE.id);
        await flushPromises();

        const sidebar = wrapper.findComponent(ContextualSidebar);
        expect(sidebar.props('country')).toEqual(FRANCE);
        expect(sidebar.props('results')).toBeNull();
    });

    it('stops before computing results when loading countries fails', async () => {
        findAllMock.mockRejectedValue(new Error('network down'));

        mountApp();
        await flushPromises();

        expect(executeMock).not.toHaveBeenCalled();
    });

    it('displays error message when loading countries fails', async () => {
        findAllMock.mockRejectedValue(new Error('network down'));

        const wrapper = mountApp();
        await flushPromises();

        expect(wrapper.find('p[role="alert"]').exists()).toBe(true);
        expect(wrapper.find('p[role="alert"]').text()).toContain('network down');
    });

    it('selects a country when the map emits country-select', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
        await flushPromises();

        const map = wrapper.findComponent(InteractiveMap);
        map.vm.$emit('country-select', GERMANY.id);
        await flushPromises();

        expect(map.props('selectedCountryId')).toBe(GERMANY.id);
    });

    it('does not render ContextualSidebar when no country is selected', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
        await flushPromises();

        expect(wrapper.findComponent(ContextualSidebar).exists()).toBe(false);
    });

    it('renders ContextualSidebar with the selected country when a country is selected', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
        await flushPromises();

        wrapper.findComponent(InteractiveMap).vm.$emit('country-select', GERMANY.id);
        await flushPromises();

        const sidebar = wrapper.findComponent(ContextualSidebar);
        expect(sidebar.exists()).toBe(true);
        expect(sidebar.props('country')).toEqual(GERMANY);
        expect(sidebar.props('results')).toEqual(RESULTS);
    });

    it('initializes slider value to baseline investment when country is selected', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
        await flushPromises();

        wrapper.findComponent(InteractiveMap).vm.$emit('country-select', GERMANY.id);
        await flushPromises();

        expect(wrapper.findComponent(ContextualSidebar).props('sliderValue')).toBe(
            GERMANY.baselineInvestment,
        );
    });

    it('recalculates the simulation for the new slider value', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
        await flushPromises();

        wrapper.findComponent(InteractiveMap).vm.$emit('country-select', GERMANY.id);
        await flushPromises();

        const updatedResults: SimulationResults = { ...RESULTS, additionalJobs: 4000 };
        executeMock.mockResolvedValue(updatedResults);

        const sidebar = wrapper.findComponent(ContextualSidebar);
        sidebar.vm.$emit('update:sliderValue', 750);
        await flushPromises();

        expect(executeMock).toHaveBeenCalledWith(GERMANY.id, 750, 'dark');
        expect(sidebar.props('sliderValue')).toBe(750);
        expect(sidebar.props('results')).toEqual(updatedResults);
    });

    it('applies the new slider value optimistically while the recalculation is pending', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
        await flushPromises();

        wrapper.findComponent(InteractiveMap).vm.$emit('country-select', GERMANY.id);
        await flushPromises();

        const { promise, resolve } = deferred<SimulationResults>();
        executeMock.mockReturnValue(promise);

        const sidebar = wrapper.findComponent(ContextualSidebar);
        sidebar.vm.$emit('update:sliderValue', 750);
        await flushPromises();

        expect(sidebar.props('sliderValue')).toBe(750);

        resolve(RESULTS);
        await flushPromises();

        expect(sidebar.props('sliderValue')).toBe(750);
    });

    it('reverts the slider value when recalculation fails', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
        await flushPromises();

        wrapper.findComponent(InteractiveMap).vm.$emit('country-select', GERMANY.id);
        await flushPromises();

        executeMock.mockRejectedValueOnce(new Error('investment exceeds max allowed'));

        const sidebar = wrapper.findComponent(ContextualSidebar);
        sidebar.vm.$emit('update:sliderValue', 750);
        await flushPromises();

        expect(sidebar.props('sliderValue')).toBe(GERMANY.baselineInvestment);
    });

    it('hides sidebar when the map deselects a country', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
        await flushPromises();

        const map = wrapper.findComponent(InteractiveMap);
        map.vm.$emit('country-select', GERMANY.id);
        await flushPromises();
        expect(wrapper.findComponent(ContextualSidebar).exists()).toBe(true);

        map.vm.$emit('country-select', null);
        await flushPromises();

        expect(wrapper.findComponent(ContextualSidebar).exists()).toBe(false);
    });

    it('hides sidebar when ContextualSidebar emits close', async () => {
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
        await flushPromises();

        wrapper.findComponent(InteractiveMap).vm.$emit('country-select', GERMANY.id);
        await flushPromises();
        const sidebar = wrapper.findComponent(ContextualSidebar);
        expect(sidebar.exists()).toBe(true);

        sidebar.vm.$emit('close');
        await flushPromises();

        expect(wrapper.findComponent(ContextualSidebar).exists()).toBe(false);
    });

    it('defaults to dark theme when no localStorage value exists', async () => {
        localStorage.removeItem('gfi-dgms-settings');
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
        await flushPromises();

        expect(wrapper.find('.theme-dark').exists()).toBe(true);
    });

    it('loads theme from localStorage on mount', async () => {
        localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'light' }));
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
        await flushPromises();

        expect(wrapper.find('.theme-light').exists()).toBe(true);
    });

    it('persists theme change to localStorage', async () => {
        localStorage.removeItem('gfi-dgms-settings');
        findAllMock.mockResolvedValue([GERMANY]);
        executeMock.mockResolvedValue(RESULTS);

        const wrapper = mountApp();
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

            expect(() => mountApp()).toThrow(SettingsParseError);
        });

        it('falls back to default settings when localStorage.getItem fails', async () => {
            const getItem = vi.fn(() => {
                throw new Error('storage access denied');
            });
            const mockLocalStorage = createMockLocalStorage({ getItem });
            vi.stubGlobal('localStorage', mockLocalStorage);
            try {
                findAllMock.mockResolvedValue([GERMANY]);
                executeMock.mockResolvedValue(RESULTS);

                const wrapper = mountApp();
                await flushPromises();

                expect(wrapper.find('.theme-dark').exists()).toBe(true);
                expect(getItem).toHaveBeenCalledWith('gfi-dgms-settings');
            } finally {
                vi.unstubAllGlobals();
            }
        });

        it('swallows SettingsStorageError on write and stops persisting afterwards', async () => {
            const setItem = vi.fn(() => {
                throw new Error('storage quota exceeded');
            });
            const mockLocalStorage = createMockLocalStorage({ setItem });
            vi.stubGlobal('localStorage', mockLocalStorage);
            try {
                findAllMock.mockResolvedValue([GERMANY]);
                executeMock.mockResolvedValue(RESULTS);

                const capturedErrors: unknown[] = [];

                const wrapper = mountApp({
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

                // The write failure is swallowed so the widget keeps working.
                expect(capturedErrors.length).toBe(0);
                expect(setItem).toHaveBeenCalledTimes(1);

                // A second theme change no longer attempts to write.
                await options[3].trigger('click');
                await flushPromises();
                expect(setItem).toHaveBeenCalledTimes(1);
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

            const wrapper = mountApp({
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

            const wrapper = mountApp({
                props: { theme: 'colorblind-dark' },
            });
            await flushPromises();

            expect(wrapper.find('.theme-colorblind-dark').exists()).toBe(true);
        });

        it('falls back to localStorage when theme prop is not provided', async () => {
            localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'light' }));
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mountApp();
            await flushPromises();

            expect(wrapper.find('.theme-light').exists()).toBe(true);
        });

        it('defaults to dark when neither theme prop nor localStorage is set', async () => {
            localStorage.removeItem('gfi-dgms-settings');
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mountApp();
            await flushPromises();

            expect(wrapper.find('.theme-dark').exists()).toBe(true);
        });

        it('still persists through localStorage when theme prop is used', async () => {
            localStorage.removeItem('gfi-dgms-settings');
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            mountApp({
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

            const wrapper = mountApp({
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

            const wrapper = mountApp({
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

            const wrapper = mountApp({
                props: { theme: 'light' },
            });
            await flushPromises();

            wrapper.findComponent(InteractiveMap).vm.$emit('country-select', GERMANY.id);
            await flushPromises();

            expect(wrapper.findComponent(ContextualSidebar).props('themeMode')).toBe('light');
        });

        it('updates ContextualSidebar theme when theme prop changes', async () => {
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mountApp({
                props: { theme: 'dark' },
            });
            await flushPromises();

            wrapper.findComponent(InteractiveMap).vm.$emit('country-select', GERMANY.id);
            await flushPromises();
            const sidebar = wrapper.findComponent(ContextualSidebar);
            expect(sidebar.props('themeMode')).toBe('dark');

            await wrapper.setProps({ theme: 'light' });
            await flushPromises();

            expect(sidebar.props('themeMode')).toBe('light');
        });

        it('applies theme CSS variables to the app container', async () => {
            findAllMock.mockResolvedValue([GERMANY]);
            executeMock.mockResolvedValue(RESULTS);

            const wrapper = mountApp({
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
