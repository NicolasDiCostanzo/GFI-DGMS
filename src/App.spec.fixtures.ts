import { MapColors } from '@/sovereign/domain/constants/MapColors';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';

export const RESULTS: SimulationResults = {
    fundingProgress: 0.75,
    additionalJobs: 2500,
    additionalCO2Tonnes: 1250,
    colorHex: MapColors.ORANGE,
};

/**
 * Creates a promise whose settlement functions are exposed to the caller.
 *
 * @returns The promise and its `resolve` and `reject` functions.
 */
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
/**
 * Creates a mock `Storage` object with an empty `getItem` default.
 *
 * @param overrides - Storage properties or methods that replace the defaults
 * @returns A mock `Storage` object
 */
export function createMockLocalStorage(overrides: Partial<Storage>): Storage {
    return {
        getItem: () => null,
        ...overrides,
    } as Storage;
}
