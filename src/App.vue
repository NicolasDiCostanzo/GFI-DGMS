<script setup lang="ts">
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import { CalculateSimulationYields } from '@/sovereign/app/CalculateSimulationYields';
import { Country, CountryId } from '@/sovereign/domain/Country';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';
import { StaticCountryRepository } from '@/sovereign/infrastructure/adapters/StaticCountryRepository';
import { CountryLoadError } from '@/sovereign/infrastructure/errors/CountryLoadError';
import InteractiveMap from '@/sovereign/infrastructure/ui/components/InteractiveMap.vue';
import { onMounted, ref } from 'vue';

const countryRepository = new StaticCountryRepository();
const calculateSimulationYields = new CalculateSimulationYields(countryRepository);

const countries = ref<Country[]>([]);
const resultsByCountry = ref<Map<CountryId, SimulationResults>>(new Map());
const selectedCountryId = ref<CountryId | null>(null);
const loadError = ref<CountryLoadError | null>(null);

onMounted(async () => {
    try {
        countries.value = await countryRepository.findAll();
    } catch (error) {
        loadError.value = new CountryLoadError(getErrorMessage(error));
        return;
    }

    const entries = await Promise.all(
        countries.value.map(async (country) => {
            try {
                const results = await calculateSimulationYields.execute(
                    country.id,
                    country.baselineInvestment,
                );
                return [country.id, results] as const;
            } catch {
                return null;
            }
        }),
    );

    resultsByCountry.value = new Map(entries.filter((entry) => entry !== null));
});

function handleCountrySelect(countryId: CountryId): void {
    selectedCountryId.value = countryId;
}
</script>

<template>
    <div class="app">
        <p v-if="loadError" role="alert">{{ loadError.message }}</p>
        <InteractiveMap
            v-else
            :countries="countries"
            :results-by-country="resultsByCountry"
            :selected-country-id="selectedCountryId"
            @country-select="handleCountrySelect"
        />
    </div>
</template>

<style scoped>
.app {
    width: 100%;
    height: 100vh;
}
</style>
