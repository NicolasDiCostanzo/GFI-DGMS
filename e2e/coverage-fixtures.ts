import { test as base } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const NYC_OUTPUT_DIR = join(process.cwd(), '.nyc_output');

export const test = base.extend({
    page: async ({ page }, use, testInfo) => {
        await use(page);

        const coverage = await page.evaluate(
            () => (window as unknown as { __coverage__?: object }).__coverage__,
        );
        if (!coverage) {
            throw new Error('Coverage data not found: VITE_COVERAGE may not be enabled');
        }

        mkdirSync(NYC_OUTPUT_DIR, { recursive: true });
        writeFileSync(
            join(NYC_OUTPUT_DIR, `e2e-${testInfo.testId}-${testInfo.retry}.json`),
            JSON.stringify(coverage),
        );
    },
});

export { expect } from '@playwright/test';
