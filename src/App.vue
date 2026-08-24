<script setup lang="ts">
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import { GetCountryFundingOverview } from '@/sovereign/app/GetCountryFundingOverview';
import type { ThemeMode } from '@/sovereign/infrastructure/ui/constants/MapColors';
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
import { useTheme } from '@/sovereign/infrastructure/ui/composables/useTheme';
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

const { themeMode, setTheme, initTheme, isThemeMode } = useTheme();
initTheme(props.theme);

const themeModel = computed({
    get: () => themeMode.value,
    set: (value: ThemeMode) => setTheme(value),
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
            setTheme(newTheme);
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
                @country-select="handleCountrySelect"
            />
            <Transition name="slide">
                <CountryFundingPanel
                    v-if="selectedCountryName"
                    :key="selectedCountryName"
                    class="sidebar-overlay"
                    :country-funding="selectedCountryFunding"
                    @close="handleSidebarClosing"
                />
            </Transition>
        </div>
        <ThemeToggle v-model:model-value="themeModel" />
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
    color: var(--text);
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
