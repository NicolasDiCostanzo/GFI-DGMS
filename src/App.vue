<script setup lang="ts">
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import { CalculateSimulationYields } from '@/sovereign/app/CalculateSimulationYields';
import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { getThemeColors } from '@/sovereign/domain/constants/MapColors';
import { Country, CountryId } from '@/sovereign/domain/Country';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';
import { StaticCountryRepository } from '@/sovereign/infrastructure/adapters/StaticCountryRepository';
import { CountryLoadError } from '@/sovereign/infrastructure/errors/CountryLoadError';
import InteractiveMap from '@/sovereign/infrastructure/ui/components/InteractiveMap.vue';
import ThemeToggle from '@/sovereign/infrastructure/ui/components/ThemeToggle.vue';
import { computed, onMounted, ref, watch } from 'vue';

const props = withDefaults(
    defineProps<{
        theme?: ThemeMode;
    }>(),
    {
        theme: undefined,
    },
);

const countryRepository = new StaticCountryRepository();
const calculateSimulationYields = new CalculateSimulationYields(countryRepository);

const countries = ref<Country[]>([]);
const resultsByCountry = ref<Map<CountryId, SimulationResults>>(new Map());
const selectedCountryId = ref<CountryId | null>(null);
const loadError = ref<CountryLoadError | null>(null);

const STORAGE_KEY = 'gfi-dgms-settings';

interface Settings {
    themeMode: ThemeMode;
}

const themeModes = new Set<ThemeMode>(['light', 'dark', 'colorblind-light', 'colorblind-dark']);

function isThemeMode(value: unknown): value is ThemeMode {
    return typeof value === 'string' && themeModes.has(value as ThemeMode);
}

function loadSettings(): Settings {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
            const parsed: unknown = JSON.parse(stored);
            if (
                typeof parsed === 'object' &&
                parsed !== null &&
                'themeMode' in parsed &&
                isThemeMode(parsed.themeMode)
            ) {
                return { themeMode: parsed.themeMode };
            }
        }
    } catch {
        // ignore parse errors
    }
    return { themeMode: 'dark' };
}

function saveSettings(settings: Settings): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
        // ignore storage errors
    }
}

const settings = ref<Settings>(loadSettings());

if (props.theme && isThemeMode(props.theme)) {
    settings.value.themeMode = props.theme;
    saveSettings(settings.value);
}

const themeMode = computed({
    get: () => props.theme ?? settings.value.themeMode,
    set: (value: ThemeMode) => {
        settings.value.themeMode = value;
        saveSettings(settings.value);
    },
});

watch(
    () => props.theme,
    (newTheme) => {
        if (newTheme && isThemeMode(newTheme)) {
            settings.value.themeMode = newTheme;
            saveSettings(settings.value);
        }
    },
);

const themeStyle = computed(() => {
    const colors = getThemeColors(themeMode.value);
    return {
        '--ocean': colors.OCEAN,
        '--inactive': colors.INACTIVE,
        '--border': colors.BORDER,
        '--tooltip-bg': colors.TOOLTIP_BG,
        '--tooltip-text': colors.TOOLTIP_TEXT,
        '--legend-bg': colors.LEGEND_BG,
        '--legend-text': colors.LEGEND_TEXT,
    } as Record<string, string>;
});

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

function handleCountrySelect(countryId: CountryId | null): void {
    selectedCountryId.value = countryId;
}
</script>

<template>
    <div class="app" :class="`theme-${themeMode}`" :style="themeStyle">
        <p v-if="loadError" role="alert">
            {{ loadError.message }}
        </p>
        <InteractiveMap
            v-else
            :countries="countries"
            :results-by-country="resultsByCountry"
            :selected-country-id="selectedCountryId"
            :theme-mode="themeMode"
            @country-select="handleCountrySelect"
        />
        <ThemeToggle v-model:model-value="themeMode" />
    </div>
</template>

<style scoped>
.app {
    width: 100%;
    height: 100vh;
}
</style>
