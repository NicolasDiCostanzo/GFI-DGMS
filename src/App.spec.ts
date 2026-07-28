// @vitest-environment happy-dom
import { Currency } from '@/shared/types/Currency';
import { MapColors } from '@/sovereign/domain/constants/MapColors';
import { Country, CountryId } from '@/sovereign/domain/Country';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';
import { TargetBudget } from '@/sovereign/domain/TargetBudget';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import App from './App.vue';

const GERMANY = new Country(
    CountryId('276'),
    'Germany',
    500,
    new TargetBudget(1000, Currency.USD()),
    10,
    5,
);

const FRANCE = new Country(
    CountryId('250'),
    'France',
    300,
    new TargetBudget(800, Currency.EUR()),
    8,
    4,
);

const RESULTS: SimulationResults = {
    fundingProgress: 0.75,
    additionalJobs: 2500,
    additionalCO2Tonnes: 1250,
    isOverTarget: false,
    colorHex: MapColors.ORANGE,
};

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
});
