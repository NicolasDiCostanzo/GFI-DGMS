<script setup lang="ts">
import { SettingsParseError } from '@/shared/errors/SettingsParseError';
import { SettingsStorageError } from '@/shared/errors/SettingsStorageError';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import { CalculateSimulationYields } from '@/sovereign/app/CalculateSimulationYields';
import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { Country, CountryId } from '@/sovereign/domain/Country';
import { SimulationResults } from '@/sovereign/domain/SimulationResults';
import { StaticCountryRepository } from '@/sovereign/infrastructure/adapters/StaticCountryRepository';
import { CountryLoadError } from '@/sovereign/infrastructure/errors/CountryLoadError';
import ContextualSidebar from '@/sovereign/infrastructure/ui/components/ContextualSidebar.vue';
import InteractiveMap from '@/sovereign/infrastructure/ui/components/InteractiveMap.vue';
import ThemeToggle from '@/sovereign/infrastructure/ui/components/ThemeToggle.vue';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { computed, onMounted, ref, watch } from 'vue';

const props = withDefaults(
    defineProps<{
        theme?: ThemeMode;
        apiEndpoint?: string;
    }>(),
    {
        theme: undefined,
        apiEndpoint: undefined,
    },
);

const countryRepository = new StaticCountryRepository();
const calculateSimulationYields = new CalculateSimulationYields(countryRepository);

const countries = ref<Country[]>([]);
const resultsByCountry = ref<Map<CountryId, SimulationResults>>(new Map());
const selectedCountryId = ref<CountryId | null>(null);
const loadError = ref<CountryLoadError | null>(null);
const sliderValue = ref<number>(0);

const STORAGE_KEY = 'gfi-dgms-settings';

interface Settings {
    themeMode: ThemeMode;
}

const themeModes = new Set<ThemeMode>(['light', 'dark', 'colorblind-light', 'colorblind-dark']);

function isThemeMode(value: unknown): value is ThemeMode {
    return typeof value === 'string' && themeModes.has(value as ThemeMode);
}

function readStoredValue(): string | null {
    try {
        return localStorage.getItem(STORAGE_KEY);
    } catch (cause) {
        throw new SettingsStorageError(
            `Failed to read settings from localStorage: ${getErrorMessage(cause)}`,
        );
    }
}

function writeStoredValue(value: string): void {
    try {
        localStorage.setItem(STORAGE_KEY, value);
    } catch (cause) {
        throw new SettingsStorageError(
            `Failed to save settings to localStorage: ${getErrorMessage(cause)}`,
        );
    }
}

const storageAvailable = ref(true);

function loadSettings(): Settings {
    let stored: string | null;
    try {
        stored = readStoredValue();
    } catch {
        storageAvailable.value = false;
        return { themeMode: 'dark' };
    }
    if (stored) {
        try {
            const parsed: unknown = JSON.parse(stored);
            if (
                typeof parsed === 'object' &&
                parsed !== null &&
                'themeMode' in parsed &&
                isThemeMode(parsed.themeMode)
            ) {
                return { themeMode: parsed.themeMode };
            }
        } catch (cause) {
            throw new SettingsParseError(
                `Failed to parse settings from localStorage: ${getErrorMessage(cause)}`,
            );
        }
    }
    return { themeMode: 'dark' };
}

function saveSettings(settings: Settings): void {
    writeStoredValue(JSON.stringify(settings));
}

function persistSettings(persistedSettings: Settings): void {
    if (!storageAvailable.value) {
        return;
    }
    try {
        saveSettings(persistedSettings);
    } catch {
        storageAvailable.value = false;
    }
}

const settings = ref<Settings>(loadSettings());

if (props.theme && isThemeMode(props.theme)) {
    settings.value.themeMode = props.theme;
    persistSettings(settings.value);
}

const themeMode = computed({
    get: () => (isThemeMode(props.theme) ? props.theme : settings.value.themeMode),
    set: (value: ThemeMode) => {
        settings.value.themeMode = value;
        persistSettings(settings.value);
    },
});

const selectedCountry = computed(() => {
    if (!selectedCountryId.value) {
        return null;
    }
    return countries.value.find((c) => c.id === selectedCountryId.value) || null;
});

watch(
    () => props.theme,
    (newTheme) => {
        if (newTheme && isThemeMode(newTheme)) {
            settings.value.themeMode = newTheme;
            persistSettings(settings.value);
        }
    },
);

watch(
    () => themeMode.value,
    async (newThemeMode) => {
        if (countries.value.length === 0) {
            return;
        }

        const entries = await Promise.all(
            countries.value.map(async (country) => {
                try {
                    const investmentAmount =
                        country.id === selectedCountryId.value
                            ? sliderValue.value
                            : country.baselineInvestment;
                    const results = await calculateSimulationYields.execute(
                        country.id,
                        investmentAmount,
                        newThemeMode,
                    );
                    return [country.id, results] as const;
                } catch {
                    return null;
                }
            }),
        );

        resultsByCountry.value = new Map(entries.filter((entry) => entry !== null));
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
        '--sidebar-bg': colors.SIDEBAR_BG,
        '--accent': colors.ACCENT,
        '--progress-bg': colors.PROGRESS_BG,
        '--error': colors.ERROR,
        '--text': colors.TEXT,
    } as Record<string, string>;
});

const appStyle = computed(() => ({
    ...themeStyle.value,
    height: '100%',
}));

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
                    themeMode.value,
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

    if (countryId && selectedCountry.value) {
        sliderValue.value = selectedCountry.value.baselineInvestment;
    } else {
        sliderValue.value = 0;
    }
}

async function handleSliderUpdate(value: number): Promise<void> {
    const countryId = selectedCountryId.value;
    const previousValue = sliderValue.value;
    sliderValue.value = value;

    if (!countryId) {
        return;
    }

    try {
        const results = await calculateSimulationYields.execute(countryId, value, themeMode.value);
        resultsByCountry.value = new Map(resultsByCountry.value).set(countryId, results);
    } catch {
        sliderValue.value = previousValue;
    }
}

function handleSidebarClosing(): void {
    selectedCountryId.value = null;
    sliderValue.value = 0;
}
</script>

<template>
    <div class="app" :class="`theme-${themeMode}`" :style="appStyle">
        <p v-if="loadError" role="alert">
            {{ loadError.message }}
        </p>
        <div v-else class="app-content">
            <InteractiveMap
                :countries="countries"
                :results-by-country="resultsByCountry"
                :selected-country-id="selectedCountryId"
                :theme-mode="themeMode"
                @country-select="handleCountrySelect"
            />
            <Transition name="slide">
                <ContextualSidebar
                    v-if="selectedCountryId"
                    class="sidebar-overlay"
                    :country="selectedCountry"
                    :results="resultsByCountry.get(selectedCountryId)"
                    :slider-value="sliderValue"
                    :theme-mode="themeMode"
                    @update:slider-value="handleSliderUpdate"
                    @close="handleSidebarClosing"
                />
            </Transition>
        </div>
        <ThemeToggle v-model:model-value="themeMode" />
    </div>
</template>

<style scoped>
.app {
    position: relative;
    width: 100%;
    height: 100%;
}

.app-content {
    position: relative;
    width: 100%;
    height: 100%;
}

.sidebar-overlay {
    position: absolute;
    right: 0;
    top: 0;
    height: 100%;
    z-index: 10;
}

.slide-enter-active,
.slide-leave-active {
    transition: transform 0.3s ease-in-out;
}

.slide-enter-from,
.slide-leave-to {
    transform: translateX(100%);
}
</style>
