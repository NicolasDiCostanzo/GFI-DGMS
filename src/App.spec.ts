import { MapColors } from '@/sovereign/domain/constants/MapColors';
import { Country } from '@/sovereign/domain/Country';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';
import {
    FRANCE,
    GERMANY,
    RESULTS,
} from '@/sovereign/infrastructure/ui/composables/useSimulationController.spec.helper';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.vue';
import { SettingsParseError } from './shared/errors/SettingsParseError.ts';

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

        it('invokes SettingsStorageError catch when localStorage.setItem fails', async () => {
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

                const wrapper = mount(App);
                await flushPromises();

                const toggle = wrapper.find('.theme-toggle');
                await toggle.trigger('mouseenter');
                const options = wrapper.findAll('.theme-toggle-option');

                try {
                    await options[2].trigger('click');
                } catch {
                    // expected: SettingsStorageError propagates through Vue event system
                }
                await flushPromises();

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
    });
});
