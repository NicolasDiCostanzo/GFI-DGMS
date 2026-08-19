<script setup lang="ts">
import { SettingsParseError } from '@/shared/errors/SettingsParseError';
import { SettingsStorageError } from '@/shared/errors/SettingsStorageError';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import { GetCountryFundingOverview } from '@/sovereign/app/GetCountryFundingOverview';
import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { CountryFunding } from '@/sovereign/domain/CountryFunding';
import { Grant } from '@/sovereign/domain/Grant';
import {
    AirtableJsonCountryFundingRepository,
    loadGrantRecords,
} from '@/sovereign/infrastructure/adapters/AirtableJsonCountryFundingRepository';
import { CountryLoadError } from '@/sovereign/infrastructure/errors/CountryLoadError';
import CountryFundingPanel from '@/sovereign/infrastructure/ui/components/country-funding-panel/CountryFundingPanel.vue';
import InteractiveMap from '@/sovereign/infrastructure/ui/components/InteractiveMap.vue';
import ThemeToggle from '@/sovereign/infrastructure/ui/components/ThemeToggle.vue';
import { getThemeColors } from '@/sovereign/infrastructure/ui/constants/ThemeColors';
import { computed, onMounted, ref, watch } from 'vue';

const props = withDefaults(
    defineProps<{
        theme?: ThemeMode;
    }>(),
    {
        theme: undefined,
    },
);

const countryFundings = ref<CountryFunding[]>([]);
const unattributedGrants = ref<Grant[]>([]);
const selectedCountryName = ref<string | null>(null);
const loadError = ref<CountryLoadError | null>(null);

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

const selectedCountryFunding = computed(() => {
    if (!selectedCountryName.value) {
        return null;
    }
    return (
        countryFundings.value.find(
            (funding) => funding.countryName === selectedCountryName.value,
        ) ?? null
    );
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
        const records = await loadGrantRecords();
        const countryFundingRepository = new AirtableJsonCountryFundingRepository(records);
        const overview = await new GetCountryFundingOverview(countryFundingRepository).execute();
        countryFundings.value = overview.countryFundings;
        unattributedGrants.value = [...overview.unattributedGrants];
    } catch (error) {
        loadError.value = new CountryLoadError(getErrorMessage(error));
    }
});

function handleCountrySelect(countryName: string | null): void {
    selectedCountryName.value = countryName;
}

function handleSidebarClosing(): void {
    selectedCountryName.value = null;
}
</script>

<template>
    <main class="app" :class="`theme-${themeMode}`" :style="appStyle">
        <h1 class="sr-only">GFI Global Funding Initiative Map</h1>
        <p v-if="loadError" role="alert">
            {{ loadError.message }}
        </p>
        <div v-else class="app-content">
            <InteractiveMap
                :country-fundings="countryFundings"
                :selected-country-name="selectedCountryName"
                :theme-mode="themeMode"
                @country-select="handleCountrySelect"
            />
            <Transition name="slide">
                <CountryFundingPanel
                    v-if="selectedCountryName"
                    :key="selectedCountryName"
                    class="sidebar-overlay"
                    :country-funding="selectedCountryFunding"
                    :theme-mode="themeMode"
                    @close="handleSidebarClosing"
                />
            </Transition>
        </div>
        <ThemeToggle v-model:model-value="themeMode" />
    </main>
</template>

<style scoped>
.app {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    font-family: var(
        --font-family,
        system-ui,
        -apple-system,
        'Segoe UI',
        Roboto,
        'Helvetica Neue',
        Arial,
        sans-serif
    );
}

.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
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
