import { MapColors } from '@/sovereign/domain/constants/MapColors';
import { Country, CountryId } from '@/sovereign/domain/Country';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';
import { TargetBudget } from '@/sovereign/domain/TargetBudget';

export const GERMANY = new Country(
    CountryId('276'),
    'Germany',
    500,
    new TargetBudget(1000),
    10,
    5,
    10000,
    5000,
);

export const FRANCE = new Country(
    CountryId('250'),
    'France',
    300,
    new TargetBudget(800),
    8,
    4,
    8000,
    4000,
);

export const RESULTS: SimulationResults = {
    fundingProgress: 0.75,
    additionalJobs: 2500,
    additionalCO2Tonnes: 1250,
    isOverTarget: false,
    colorHex: MapColors.ORANGE,
};

export function deferred<T>() {
    let resolve!: (value: T) => void;
    let reject!: (reason: Error) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });
    return { promise, resolve, reject };
}

// Only getItem gets a real (always-empty) default: it's the only member every
// caller relies on without overriding. App.vue never calls removeItem/clear/key,
// and setItem has no shared default since every current caller overrides it.
export function createMockLocalStorage(overrides: Partial<Storage>): Storage {
    return {
        getItem: () => null,
        ...overrides,
    } as Storage;
}
