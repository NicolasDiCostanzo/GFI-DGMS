import { CountryId } from '@/sovereign/domain/Country';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useSimulationController } from './useSimulationController';
import {
    createController,
    deferred,
    GERMANY,
    mockHappyPath,
    MockRepository,
    MockUseCase,
    RESULTS,
    useFakeDateTimers,
} from './useSimulationController.spec.helper';

const DEU = 'DEU' as CountryId;

describe('useSimulationController', () => {
    describe('initial state', () => {
        const controller = useSimulationController(
            new MockUseCase() as unknown as never,
            new MockRepository() as unknown as never,
        );

        it('has correct default values', () => {
            expect(controller.selectedCountry.value).toBeNull();
            expect(controller.sliderValue.value).toBe(0);
            expect(controller.simulationResults.value).toBeNull();
            expect(controller.allCountries.value).toEqual([]);
            expect(controller.isLoading.value).toBe(false);
            expect(controller.error.value).toBeNull();
        });
    });

    let useCase: MockUseCase;
    let repository: MockRepository;
    let controller: ReturnType<typeof useSimulationController>;

    beforeEach(() => {
        const created = createController();
        useCase = created.useCase;
        repository = created.repository;
        controller = created.controller;
    });

    describe('loadCountries()', () => {
        it('populates allCountries from the repository', async () => {
            const countries = [GERMANY];
            repository.findAll.mockResolvedValue(countries);

            await controller.loadCountries();

            expect(controller.allCountries.value).toEqual(countries);
            expect(repository.findAll).toHaveBeenCalledOnce();
        });

        it('does not trigger simulation', async () => {
            repository.findAll.mockResolvedValue([]);

            await controller.loadCountries();

            expect(useCase.execute).not.toHaveBeenCalled();
        });

        it('handles repository errors', async () => {
            repository.findAll.mockRejectedValue(new Error('Network error'));

            await controller.loadCountries();

            expect(controller.error.value).toBe('Network error');
            expect(controller.isLoading.value).toBe(false);
        });
    });

    describe('loadCountries() stale request handling', () => {
        useFakeDateTimers();

        it('ignores stale result when superseded by newer request', async () => {
            const first = deferred<(typeof GERMANY)[]>();
            repository.findAll.mockReturnValueOnce(first.promise);

            const firstCall = controller.loadCountries();

            repository.findAll.mockResolvedValue([GERMANY]);
            await controller.loadCountries();

            first.resolve([]);
            await firstCall;

            expect(controller.allCountries.value).toEqual([GERMANY]);
            expect(controller.isLoading.value).toBe(false);
        });

        it('ignores stale error when superseded by newer request', async () => {
            const first = deferred<(typeof GERMANY)[]>();
            repository.findAll.mockReturnValueOnce(first.promise);

            const firstCall = controller.loadCountries();

            repository.findAll.mockResolvedValue([GERMANY]);
            await controller.loadCountries();

            first.reject(new Error('Stale error'));
            await firstCall;

            expect(controller.error.value).toBeNull();
            expect(controller.isLoading.value).toBe(false);
        });
    });

    describe('selectCountry()', () => {
        it('sets selectedCountry and resets sliderValue to baseline', async () => {
            mockHappyPath(repository, useCase);

            await controller.selectCountry(DEU);

            expect(controller.selectedCountry.value).toStrictEqual(GERMANY);
            expect(controller.sliderValue.value).toBe(500);
        });

        it('runs simulation with country id and baseline investment', async () => {
            mockHappyPath(repository, useCase);

            await controller.selectCountry(DEU);

            expect(useCase.execute).toHaveBeenCalledWith('DEU', 500);
            expect(controller.simulationResults.value).toStrictEqual(RESULTS);
        });

        it('toggles isLoading during execution', async () => {
            mockHappyPath(repository, useCase);

            const promise = controller.selectCountry(DEU);

            expect(controller.isLoading.value).toBe(true);
            await promise;
            expect(controller.isLoading.value).toBe(false);
        });

        it('sets error when country is not found', async () => {
            repository.findById.mockResolvedValue(null);

            await controller.selectCountry('UNKNOWN' as CountryId);

            expect(controller.error.value).toBe('Country UNKNOWN not found');
            expect(controller.selectedCountry.value).toBeNull();
            expect(controller.isLoading.value).toBe(false);
            expect(useCase.execute).not.toHaveBeenCalled();
        });

        it('handles use case errors', async () => {
            repository.findById.mockResolvedValue(GERMANY);
            useCase.execute.mockRejectedValue(new Error('Investment invalid'));

            await controller.selectCountry(DEU);

            expect(controller.error.value).toBe('Investment invalid');
            expect(controller.isLoading.value).toBe(false);
            expect(controller.simulationResults.value).toBeNull();
        });

        it('clears previous error on success', async () => {
            repository.findById.mockResolvedValue(GERMANY);
            useCase.execute
                .mockRejectedValueOnce(new Error('Previous error'))
                .mockResolvedValueOnce(RESULTS);

            await controller.selectCountry(DEU);
            expect(controller.error.value).toBe('Previous error');

            useCase.execute.mockResolvedValue(RESULTS);
            await controller.selectCountry(DEU);

            expect(controller.error.value).toBeNull();
        });
    });

    describe('selectCountry() stale request handling', () => {
        useFakeDateTimers();

        it('ignores stale findById result when superseded by newer request', async () => {
            const findById = deferred<typeof GERMANY | null>();
            repository.findById.mockReturnValueOnce(findById.promise);
            useCase.execute.mockResolvedValue(RESULTS);

            const firstPromise = controller.selectCountry(DEU);

            mockHappyPath(repository, useCase);
            await controller.selectCountry(DEU);

            findById.resolve(GERMANY);
            await firstPromise;

            expect(useCase.execute).toHaveBeenCalledTimes(1);
            expect(controller.isLoading.value).toBe(false);
        });

        it('ignores stale useCase result when superseded by newer request', async () => {
            const firstExecute = deferred<typeof RESULTS>();
            mockHappyPath(repository, useCase);
            useCase.execute.mockReturnValueOnce(firstExecute.promise).mockResolvedValue(RESULTS);

            const firstPromise = controller.selectCountry(DEU);
            await vi.waitFor(() => expect(useCase.execute).toHaveBeenCalledTimes(1));

            await controller.selectCountry(DEU);

            firstExecute.resolve(RESULTS);
            await firstPromise;

            expect(useCase.execute).toHaveBeenCalledTimes(2);
            expect(controller.isLoading.value).toBe(false);
        });

        it('ignores stale error when superseded by newer request', async () => {
            const firstExecute = deferred<typeof RESULTS>();
            mockHappyPath(repository, useCase);
            useCase.execute.mockReturnValueOnce(firstExecute.promise).mockResolvedValue(RESULTS);

            const firstPromise = controller.selectCountry(DEU);
            await vi.waitFor(() => expect(useCase.execute).toHaveBeenCalledTimes(1));

            await controller.selectCountry(DEU);

            firstExecute.reject(new Error('Stale error'));
            await firstPromise;

            expect(controller.error.value).toBeNull();
            expect(controller.isLoading.value).toBe(false);
        });
    });

    describe('setSliderValue()', () => {
        it('updates sliderValue and recalculates simulation', async () => {
            mockHappyPath(repository, useCase);
            await controller.selectCountry(DEU);

            await controller.setSliderValue(750);

            expect(controller.sliderValue.value).toBe(750);
            expect(useCase.execute).toHaveBeenCalledWith('DEU', 750);
        });

        it('does nothing when no country is selected', async () => {
            await controller.setSliderValue(500);

            expect(controller.sliderValue.value).toBe(0);
            expect(useCase.execute).not.toHaveBeenCalled();
        });

        it('handles use case errors', async () => {
            mockHappyPath(repository, useCase);
            await controller.selectCountry(DEU);
            useCase.execute.mockRejectedValueOnce(new Error('Exceeds maximum'));

            await controller.setSliderValue(9999);

            expect(controller.sliderValue.value).toBe(500);
            expect(controller.error.value).toBe('Exceeds maximum');
            expect(controller.isLoading.value).toBe(false);
        });

        it('clears previous error on success', async () => {
            mockHappyPath(repository, useCase);
            await controller.selectCountry(DEU);
            useCase.execute
                .mockRejectedValueOnce(new Error('Previous error'))
                .mockResolvedValueOnce(RESULTS);

            await controller.setSliderValue(9999);
            expect(controller.sliderValue.value).toBe(500);
            expect(controller.error.value).toBe('Previous error');

            await controller.setSliderValue(600);
            expect(controller.error.value).toBeNull();
            expect(controller.sliderValue.value).toBe(600);
        });
    });

    describe('setSliderValue() stale request handling', () => {
        useFakeDateTimers();

        it('ignores stale result when superseded by newer request', async () => {
            mockHappyPath(repository, useCase);
            await controller.selectCountry(DEU);

            const first = deferred<typeof RESULTS>();
            useCase.execute.mockReturnValueOnce(first.promise);

            const firstCall = controller.setSliderValue(600);

            useCase.execute.mockResolvedValue(RESULTS);
            await controller.setSliderValue(700);

            first.resolve(RESULTS);
            await firstCall;

            expect(controller.sliderValue.value).toBe(700);
            expect(controller.isLoading.value).toBe(false);
        });

        it('ignores stale error when superseded by newer request', async () => {
            mockHappyPath(repository, useCase);
            await controller.selectCountry(DEU);

            const first = deferred<typeof RESULTS>();
            useCase.execute.mockReturnValueOnce(first.promise);

            const firstCall = controller.setSliderValue(600);

            useCase.execute.mockResolvedValue(RESULTS);
            await controller.setSliderValue(700);

            first.reject(new Error('Stale error'));
            await firstCall;

            expect(controller.error.value).toBeNull();
            expect(controller.sliderValue.value).toBe(700);
            expect(controller.isLoading.value).toBe(false);
        });
    });
});
