import { Currency } from '@/shared/types/Currency';
import { afterEach, beforeEach, vi } from 'vitest';
import { CalculateSimulationYields } from '../../../app/CalculateSimulationYields';
import { MapColors } from '../../../domain/constants/MapColors';
import { Country, CountryId } from '../../../domain/Country';
import { CountryRepository } from '../../../domain/repository/CountryRepository';
import { SimulationResults } from '../../../domain/SimulationResults';
import { TargetBudget } from '../../../domain/TargetBudget';
import { useSimulationController } from './useSimulationController';

export class MockUseCase {
    execute = vi.fn<(countryId: string, investmentAmount: number) => Promise<SimulationResults>>();
}

export class MockRepository implements CountryRepository {
    findById = vi.fn<(_: CountryId) => Promise<Country | null>>();
    findAll = vi.fn<() => Promise<Country[]>>();
}

export const GERMANY = new Country(
    CountryId('DEU'),
    'Germany',
    500,
    new TargetBudget(1000, Currency.USD()),
    10,
    5,
);

export const RESULTS: SimulationResults = {
    fundingProgress: 0.5,
    additionalJobs: 1000,
    additionalCO2Tonnes: 500,
    isOverTarget: false,
    colorHex: MapColors.ORANGE,
};

export function createController() {
    const useCase = new MockUseCase();
    const repository = new MockRepository();
    const controller = useSimulationController(
        useCase as unknown as CalculateSimulationYields,
        repository,
    );
    return { useCase, repository, controller };
}

export function mockHappyPath(
    repository: MockRepository,
    useCase: MockUseCase,
    country = GERMANY,
    results = RESULTS,
) {
    repository.findById.mockResolvedValue(country);
    useCase.execute.mockResolvedValue(results);
}

export function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

export function useFakeDateTimers() {
    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['Date'] });
    });

    afterEach(() => {
        vi.useRealTimers();
    });
}
