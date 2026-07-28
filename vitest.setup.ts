import { afterAll } from 'vitest';
import { randomUUID } from 'node:crypto';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

afterAll(() => {
    const coverage = (globalThis as { __coverage__?: object }).__coverage__;
    if (!coverage) return;

    const dir = join(process.cwd(), '.nyc_output');
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `vitest-${randomUUID()}.json`), JSON.stringify(coverage));
});
