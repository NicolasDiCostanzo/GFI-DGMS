import { SettingsParseError } from '@/shared/errors/SettingsParseError';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { useTheme } from './useTheme';

function createMockLocalStorage(overrides: Partial<Storage> = {}): Storage {
    const store = new Map<string, string>();
    return {
        getItem: vi.fn((key: string) => store.get(key) ?? null),
        setItem: vi.fn((key: string, value: string) => {
            store.set(key, value);
        }),
        removeItem: vi.fn((key: string) => {
            store.delete(key);
        }),
        clear: vi.fn(() => {
            store.clear();
        }),
        key: vi.fn((index: number) => Array.from(store.keys())[index] ?? null),
        get length() {
            return store.size;
        },
        ...overrides,
    } as Storage;
}

describe('useTheme', () => {
    beforeEach(() => {
        localStorage.clear();
        useTheme().resetTheme();
    });

    it('defaults to dark theme when no localStorage value exists', () => {
        const { themeMode } = useTheme();
        expect(themeMode.value).toBe('dark');
    });

    it('loads theme from localStorage', () => {
        localStorage.setItem('gfi-dgms-settings', JSON.stringify({ themeMode: 'light' }));
        const { themeMode } = useTheme();
        expect(themeMode.value).toBe('light');
    });

    it('setTheme updates the theme and persists to localStorage', () => {
        const { themeMode, setTheme } = useTheme();
        setTheme('colorblind-light');
        expect(themeMode.value).toBe('colorblind-light');
        const stored = JSON.parse(localStorage.getItem('gfi-dgms-settings') || '{}');
        expect(stored.themeMode).toBe('colorblind-light');
    });

    it('initTheme applies a valid theme prop', () => {
        const { themeMode, initTheme } = useTheme();
        initTheme('light');
        expect(themeMode.value).toBe('light');
    });

    it('initTheme ignores an invalid theme prop', () => {
        const { themeMode, initTheme } = useTheme();
        initTheme('invalid' as never);
        expect(themeMode.value).toBe('dark');
    });

    it('setTheme ignores an invalid theme', () => {
        const { themeMode, setTheme } = useTheme();
        setTheme('invalid' as never);
        expect(themeMode.value).toBe('dark');
    });

    it.each([
        ['dark', true],
        ['colorblind-dark', true],
        ['light', false],
        ['colorblind-light', false],
    ] as const)('isDark is %s for %s', (mode, expected) => {
        const { isDark, setTheme } = useTheme();
        setTheme(mode);
        expect(isDark.value).toBe(expected);
    });

    it('throws SettingsParseError when localStorage contains invalid JSON', () => {
        localStorage.setItem('gfi-dgms-settings', '{invalid json}');
        expect(() => useTheme()).toThrow(SettingsParseError);
    });

    it('falls back to dark when localStorage.getItem fails', () => {
        const getItem = vi.fn(() => {
            throw new Error('storage access denied');
        });
        const mockLocalStorage = createMockLocalStorage({ getItem });
        vi.stubGlobal('localStorage', mockLocalStorage);
        try {
            const { themeMode } = useTheme();
            expect(themeMode.value).toBe('dark');
        } finally {
            vi.unstubAllGlobals();
        }
    });

    it('swallows write errors and stops persisting afterwards', () => {
        const setItem = vi.fn(() => {
            throw new Error('storage quota exceeded');
        });
        const mockLocalStorage = createMockLocalStorage({ setItem });
        vi.stubGlobal('localStorage', mockLocalStorage);
        try {
            const { setTheme } = useTheme();
            setTheme('light');
            setTheme('dark');
            expect(setItem).toHaveBeenCalledTimes(1);
        } finally {
            vi.unstubAllGlobals();
        }
    });
});
