import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import type { CountryFunding } from '@/sovereign/domain/CountryFunding';
import type { Grant } from '@/sovereign/domain/Grant';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createMockLocalStorage, FRANCE_FUNDING, GERMANY_FUNDING } from './App.spec.fixtures.ts';
import App from './App.vue';
import { SettingsParseError } from './shared/errors/SettingsParseError.ts';
import CountryFundingPanel from './sovereign/infrastructure/ui/components/country-funding-panel/CountryFundingPanel.vue';
import InteractiveMap from './sovereign/infrastructure/ui/components/InteractiveMap.vue';

const findAllMock = vi.fn<() => Promise<CountryFunding[]>>();
const findUnattributedGrantsMock = vi.fn<() => Promise<readonly Grant[]>>();

vi.mock('@/sovereign/infrastructure/adapters/AirtableJsonCountryFundingRepository', () => ({
    AirtableJsonCountryFundingRepository: vi.fn().mockImplementation(function () {
        return { findAll: findAllMock, findUnattributedGrants: findUnattributedGrantsMock };
    }),
    loadGrantRecords: vi.fn().mockResolvedValue([]),
}));

function mountApp(options: Parameters<typeof mount<typeof App>>[1] = {}) {
    return mount(App, {
        ...options,
        global: {
            ...options.global,
            stubs: { InteractiveMap: true, CountryFundingPanel: true },
        },
    });
}

function mountWithTrackingPanel({ count }: { count: () => void }) {
    const wrapper = mount(App, {
        global: {
            stubs: {
                InteractiveMap: true,
                CountryFundingPanel: {
                    template: '<div class="tracked-panel"><slot /></div>',
                    mounted() {
                        count();
                    },
                },
            },
        },
    });
    return { wrapper };
}

describe('App', () => {
    beforeEach(() => {
        findAllMock.mockReset();
        findUnattributedGrantsMock.mockReset();
        findUnattributedGrantsMock.mockResolvedValue([]);
    });

    it('loads country fundings and passes them down to the map and the EU dial', async () => {
        findAllMock.mockResolvedValue([GERMANY_FUNDING, FRANCE_FUNDING]);

        const wrapper = mountApp();
        await flushPromises();

        expect(wrapper.findComponent(InteractiveMap).props('countryFundings')).toEqual([
            GERMANY_FUNDING,
            FRANCE_FUNDING,
        ]);
    });

    it('displays error message when loading country fundings fails', async () => {
        findAllMock.mockRejectedValue(new Error('network down'));

        const wrapper = mountApp();
        await flushPromises();

        expect(wrapper.find('p[role="alert"]').exists()).toBe(true);
        expect(wrapper.find('p[role="alert"]').text()).toContain('network down');
    });

    it('displays error message when loading unattributed grants fails', async () => {
        findAllMock.mockResolvedValue([]);
        findUnattributedGrantsMock.mockRejectedValue(new Error('network down'));

        const wrapper = mountApp();
        await flushPromises();

        expect(wrapper.find('p[role="alert"]').exists()).toBe(true);
    });

    it('does not render CountryFundingPanel when no country is selected', async () => {
        findAllMock.mockResolvedValue([GERMANY_FUNDING]);

        const wrapper = mountApp();
        await flushPromises();

        expect(wrapper.findComponent(CountryFundingPanel).exists()).toBe(false);
    });

    it('renders CountryFundingPanel with the selected country when a country is selected', async () => {
        findAllMock.mockResolvedValue([GERMANY_FUNDING]);

        const wrapper = mountApp();
        await flushPromises();

        wrapper.findComponent(InteractiveMap).vm.$emit('country-select', 'Germany');
        await flushPromises();

        const panel = wrapper.findComponent(CountryFundingPanel);
        expect(panel.exists()).toBe(true);
        expect(panel.props('countryFunding')).toEqual(GERMANY_FUNDING);
    });

    it('hides the panel when the map deselects a country', async () => {
        findAllMock.mockResolvedValue([GERMANY_FUNDING]);

        const wrapper = mountApp();
        await flushPromises();

        const map = wrapper.findComponent(InteractiveMap);
        map.vm.$emit('country-select', 'Germany');
        await flushPromises();
        expect(wrapper.findComponent(CountryFundingPanel).exists()).toBe(true);

        map.vm.$emit('country-select', null);
        await flushPromises();

        expect(wrapper.findComponent(CountryFundingPanel).exists()).toBe(false);
    });

    it('hides the panel when CountryFundingPanel emits close', async () => {
        findAllMock.mockResolvedValue([GERMANY_FUNDING]);

        const wrapper = mountApp();
        await flushPromises();

        wrapper.findComponent(InteractiveMap).vm.$emit('country-select', 'Germany');
        await flushPromises();
        const panel = wrapper.findComponent(CountryFundingPanel);
        expect(panel.exists()).toBe(true);

        panel.vm.$emit('close');
        await flushPromises();

        expect(wrapper.findComponent(CountryFundingPanel).exists()).toBe(false);
    });

    it('defaults to dark theme when no localStorage value exists', async () => {
        localStorage.removeItem('gfi-dgms-settings');
        findAllMock.mockResolvedValue([GERMANY_FUNDING]);

        const wrapper = mountApp();
        await flushPromises();

        expect(wrapper.find('.theme-dark').exists()).toBe(true);
    });

    it('loads theme from localStorage on mount', async () => {
        localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'light' }));
        findAllMock.mockResolvedValue([GERMANY_FUNDING]);

        const wrapper = mountApp();
        await flushPromises();

        expect(wrapper.find('.theme-light').exists()).toBe(true);
    });

    it('persists theme change to localStorage', async () => {
        localStorage.removeItem('gfi-dgms-settings');
        findAllMock.mockResolvedValue([GERMANY_FUNDING]);

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
            findAllMock.mockResolvedValue([GERMANY_FUNDING]);

            expect(() => mountApp()).toThrow(SettingsParseError);
        });

        it('falls back to default settings when localStorage.getItem fails', async () => {
            const getItem = vi.fn(() => {
                throw new Error('storage access denied');
            });
            const mockLocalStorage = createMockLocalStorage({ getItem });
            vi.stubGlobal('localStorage', mockLocalStorage);
            try {
                findAllMock.mockResolvedValue([GERMANY_FUNDING]);

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
                findAllMock.mockResolvedValue([GERMANY_FUNDING]);

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

                expect(capturedErrors.length).toBe(0);
                expect(setItem).toHaveBeenCalledTimes(1);

                await options[3].trigger('click');
                await flushPromises();
                expect(setItem).toHaveBeenCalledTimes(1);
            } finally {
                vi.unstubAllGlobals();
            }
        });
    });

    describe('CountryFundingPanel remounting', () => {
        beforeEach(() => {
            localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'dark' }));
        });

        it('remounts the panel when a different country is selected', async () => {
            findAllMock.mockResolvedValue([GERMANY_FUNDING, FRANCE_FUNDING]);

            const mountCount = vi.fn();
            const { wrapper } = mountWithTrackingPanel({ count: mountCount });
            await flushPromises();

            const map = wrapper.findComponent(InteractiveMap);
            map.vm.$emit('country-select', 'Germany');
            await flushPromises();
            expect(mountCount).toHaveBeenCalledTimes(1);

            map.vm.$emit('country-select', 'France');
            await flushPromises();
            expect(mountCount).toHaveBeenCalledTimes(2);
        });

        it('remounts the panel after deselect and re-select', async () => {
            findAllMock.mockResolvedValue([GERMANY_FUNDING]);

            const mountCount = vi.fn();
            const { wrapper } = mountWithTrackingPanel({ count: mountCount });
            await flushPromises();

            const map = wrapper.findComponent(InteractiveMap);
            map.vm.$emit('country-select', 'Germany');
            await flushPromises();
            expect(mountCount).toHaveBeenCalledTimes(1);

            map.vm.$emit('country-select', null);
            await flushPromises();

            map.vm.$emit('country-select', 'Germany');
            await flushPromises();
            expect(mountCount).toHaveBeenCalledTimes(2);
        });
    });

    describe('theme prop', () => {
        it('uses the theme prop value when provided, overrides localStorage', async () => {
            localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'dark' }));
            findAllMock.mockResolvedValue([GERMANY_FUNDING]);

            const wrapper = mountApp({
                props: { theme: 'light' },
            });
            await flushPromises();

            expect(wrapper.find('.theme-light').exists()).toBe(true);
            expect(wrapper.find('.theme-dark').exists()).toBe(false);
        });

        it('uses the theme prop value when provided, regardless of localStorage', async () => {
            localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'light' }));
            findAllMock.mockResolvedValue([GERMANY_FUNDING]);

            const wrapper = mountApp({
                props: { theme: 'colorblind-dark' },
            });
            await flushPromises();

            expect(wrapper.find('.theme-colorblind-dark').exists()).toBe(true);
        });

        it('falls back to localStorage when theme prop is not provided', async () => {
            localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'light' }));
            findAllMock.mockResolvedValue([GERMANY_FUNDING]);

            const wrapper = mountApp();
            await flushPromises();

            expect(wrapper.find('.theme-light').exists()).toBe(true);
        });

        it('defaults to dark when neither theme prop nor localStorage is set', async () => {
            localStorage.removeItem('gfi-dgms-settings');
            findAllMock.mockResolvedValue([GERMANY_FUNDING]);

            const wrapper = mountApp();
            await flushPromises();

            expect(wrapper.find('.theme-dark').exists()).toBe(true);
        });

        it('still persists through localStorage when theme prop is used', async () => {
            localStorage.removeItem('gfi-dgms-settings');
            findAllMock.mockResolvedValue([GERMANY_FUNDING]);

            mountApp({
                props: { theme: 'colorblind-light' },
            });
            await flushPromises();

            const stored = JSON.parse(localStorage.getItem('gfi-dgms-settings') || '{}');
            expect(stored.themeMode).toBe('colorblind-light');
        });

        it('falls back to settings when theme prop has an invalid runtime value', async () => {
            localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'light' }));
            findAllMock.mockResolvedValue([GERMANY_FUNDING]);

            const wrapper = mountApp({
                props: { theme: 'invalid-theme' as unknown as ThemeMode },
            });
            await flushPromises();

            expect(wrapper.find('.theme-light').exists()).toBe(true);
            expect(wrapper.find('.theme-invalid-theme').exists()).toBe(false);
        });

        it('updates the UI when theme prop changes', async () => {
            localStorage.removeItem('gfi-dgms-settings');
            findAllMock.mockResolvedValue([GERMANY_FUNDING]);

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

        it('passes theme mode to CountryFundingPanel', async () => {
            findAllMock.mockResolvedValue([GERMANY_FUNDING]);

            const wrapper = mountApp({
                props: { theme: 'light' },
            });
            await flushPromises();

            wrapper.findComponent(InteractiveMap).vm.$emit('country-select', 'Germany');
            await flushPromises();

            expect(wrapper.findComponent(CountryFundingPanel).props('themeMode')).toBe('light');
        });

        it('updates CountryFundingPanel theme when theme prop changes', async () => {
            findAllMock.mockResolvedValue([GERMANY_FUNDING]);

            const wrapper = mountApp({
                props: { theme: 'dark' },
            });
            await flushPromises();

            wrapper.findComponent(InteractiveMap).vm.$emit('country-select', 'Germany');
            await flushPromises();
            const panel = wrapper.findComponent(CountryFundingPanel);
            expect(panel.props('themeMode')).toBe('dark');

            await wrapper.setProps({ theme: 'light' });
            await flushPromises();

            expect(panel.props('themeMode')).toBe('light');
        });

        it('applies theme CSS variables to the app container', async () => {
            findAllMock.mockResolvedValue([GERMANY_FUNDING]);

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
