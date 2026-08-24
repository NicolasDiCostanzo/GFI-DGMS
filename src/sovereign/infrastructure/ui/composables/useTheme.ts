import { SettingsParseError } from '@/shared/errors/SettingsParseError';
import { SettingsStorageError } from '@/shared/errors/SettingsStorageError';
import { getErrorMessage } from '@/shared/utils/getErrorMessage';
import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { computed, ref } from 'vue';

const STORAGE_KEY = 'gfi-dgms-settings';
const THEME_MODES = new Set<ThemeMode>(['light', 'dark', 'colorblind-light', 'colorblind-dark']);

function isThemeMode(value: unknown): value is ThemeMode {
    return typeof value === 'string' && THEME_MODES.has(value as ThemeMode);
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

interface Settings {
    themeMode: ThemeMode;
}

function loadSettings(): Settings {
    let stored: string | null;
    try {
        stored = readStoredValue();
    } catch {
        storageAvailable = false;
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

let storageAvailable = true;
let initialized = false;
const themeMode = ref<ThemeMode>('dark');
const isDark = computed(() => themeMode.value === 'dark' || themeMode.value === 'colorblind-dark');

function persistSettings(persistedSettings: Settings): void {
    if (!storageAvailable) {
        return;
    }
    try {
        writeStoredValue(JSON.stringify(persistedSettings));
    } catch {
        storageAvailable = false;
    }
}

export function useTheme() {
    if (!initialized) {
        const settings = loadSettings();
        themeMode.value = settings.themeMode;
        initialized = true;
    }

    function setTheme(mode: ThemeMode): void {
        if (!isThemeMode(mode)) {
            return;
        }
        themeMode.value = mode;
        persistSettings({ themeMode: mode });
    }

    function initTheme(themeProp?: ThemeMode): void {
        if (themeProp && isThemeMode(themeProp)) {
            setTheme(themeProp);
        }
    }

    return { themeMode, isDark, setTheme, initTheme, isThemeMode, resetTheme };
}

export function resetTheme(): void {
    initialized = false;
    storageAvailable = true;
    themeMode.value = 'dark';
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch {
        // ignore
    }
}
