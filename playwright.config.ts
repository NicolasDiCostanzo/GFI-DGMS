import { defineConfig, devices } from '@playwright/test';

const PORT = 5174;

export default defineConfig({
    testDir: '.',
    fullyParallel: true,
    testMatch: ['e2e/**/*.spec.ts', 'src/**/*.playwright.spec.ts'],
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: `http://127.0.0.1:${PORT}`,
        trace: 'on-first-retry',
    },
    webServer: {
        command: `npm run dev -- --host 127.0.0.1 --port ${PORT} --strictPort`,
        url: `http://127.0.0.1:${PORT}`,
        reuseExistingServer: false,
        cwd: '.',
        timeout: 120_000,
        stdout: 'pipe',
        stderr: 'pipe',
        env: {
            VITE_COVERAGE: 'true',
        },
    },
    projects: [
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
        },
    ],
});
