import { computed, ref } from 'vue';
import { getErrorMessage } from '../../../../shared/utils/getErrorMessage';
import type { CalculateSimulationYields } from '../../../app/CalculateSimulationYields';
import type { Country, CountryId } from '../../../domain/Country';
import type { CountryRepository } from '../../../domain/repository/CountryRepository';
import type { SimulationResults } from '../../../domain/SimulationResults';

function createStaleRequestGuard() {
    let currentId = 0;
    return {
        start: () => ++currentId,
        isStale: (requestId: number) => requestId !== currentId,
    };
}

export function useSimulationController(
    useCase: CalculateSimulationYields,
    repository: CountryRepository,
) {
    const selectedCountry = ref<Country | null>(null);
    const sliderValue = ref(0);
    const simulationResults = ref<SimulationResults | null>(null);
    const allCountries = ref<Country[]>([]);
    const isLoadingCountries = ref(false);
    const isLoadingSimulation = ref(false);
    const isLoading = computed(() => isLoadingCountries.value || isLoadingSimulation.value);
    const error = ref<string | null>(null);

    const countriesGuard = createStaleRequestGuard();
    const simulationGuard = createStaleRequestGuard();

    async function loadCountries(): Promise<void> {
        const requestId = countriesGuard.start();

        error.value = null;
        isLoadingCountries.value = true;

        try {
            const countries = await repository.findAll();

            if (countriesGuard.isStale(requestId)) return;
            allCountries.value = countries;
        } catch (e) {
            if (countriesGuard.isStale(requestId)) return;
            error.value = getErrorMessage(e);
        } finally {
            if (!countriesGuard.isStale(requestId)) {
                isLoadingCountries.value = false;
            }
        }
    }

    async function selectCountry(id: CountryId): Promise<void> {
        const requestId = simulationGuard.start();

        error.value = null;
        isLoadingSimulation.value = true;
        simulationResults.value = null;

        try {
            const country = await repository.findById(id);

            if (simulationGuard.isStale(requestId)) return;

            if (country === null) {
                error.value = `Country ${id} not found`;
                selectedCountry.value = null;
                sliderValue.value = 0;
                return;
            }

            selectedCountry.value = country;
            sliderValue.value = country.baselineInvestment;

            const results = await useCase.execute(id, country.baselineInvestment);

            if (simulationGuard.isStale(requestId)) return;

            simulationResults.value = results;
        } catch (e) {
            if (simulationGuard.isStale(requestId)) return;
            error.value = getErrorMessage(e);
            simulationResults.value = null;
        } finally {
            if (!simulationGuard.isStale(requestId)) {
                isLoadingSimulation.value = false;
            }
        }
    }

    async function setSliderValue(value: number): Promise<void> {
        if (selectedCountry.value === null) {
            return;
        }

        const requestId = simulationGuard.start();
        const previousValue = sliderValue.value;

        error.value = null;
        isLoadingSimulation.value = true;
        sliderValue.value = value;

        try {
            const results = await useCase.execute(selectedCountry.value.id, value);

            if (simulationGuard.isStale(requestId)) return;
            simulationResults.value = results;
        } catch (e) {
            if (simulationGuard.isStale(requestId)) return;
            sliderValue.value = previousValue;
            error.value = getErrorMessage(e);
        } finally {
            if (!simulationGuard.isStale(requestId)) {
                isLoadingSimulation.value = false;
            }
        }
    }

    return {
        selectedCountry,
        sliderValue,
        simulationResults,
        allCountries,
        isLoading,
        error,
        loadCountries,
        selectCountry,
        setSliderValue,
    };
}
