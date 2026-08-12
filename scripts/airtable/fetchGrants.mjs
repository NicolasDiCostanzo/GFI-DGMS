import { writeFile } from 'node:fs/promises';
import { normalizeGrantRecord } from './normalizeGrantRecord.mjs';

const BASE_ID = 'appbU29xVGtDvETSq';
const TABLE_ID = 'tbl17N1HQJVJFCsQU';
const OUTPUT_PATH = new URL(
    '../../src/sovereign/infrastructure/data/grants.json',
    import.meta.url,
);
const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 1_000;

function isRetryableStatus(status) {
    return status === 429 || (status >= 500 && status <= 599);
}

function getRetryDelayMs(response, attempt) {
    const retryAfter = response.headers.get('retry-after');
    if (retryAfter) {
        const seconds = Number(retryAfter);
        if (Number.isFinite(seconds) && seconds >= 0) {
            return seconds * 1_000;
        }
    }
    return BASE_BACKOFF_MS * 2 ** attempt;
}

async function fetchWithRetry(url, init) {
    let lastResponse;
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
        const response = await fetch(url, init);
        if (response.ok) {
            return response;
        }
        if (!isRetryableStatus(response.status) || attempt === MAX_RETRIES) {
            throw new Error(
                `Airtable API request failed: ${response.status} ${response.statusText}`,
            );
        }
        lastResponse = response;
        await new Promise((resolve) => setTimeout(resolve, getRetryDelayMs(response, attempt)));
    }
    throw new Error(
        `Airtable API request failed: ${lastResponse.status} ${lastResponse.statusText}`,
    );
}

async function fetchAllRecords(token) {
    const records = [];
    let offset;

    do {
        const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
        url.searchParams.set('pageSize', '100');
        if (offset) {
            url.searchParams.set('offset', offset);
        }

        const response = await fetchWithRetry(url, {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(30_000),
        });

        const data = await response.json();
        records.push(...data.records);
        offset = data.offset;
    } while (offset);

    return records;
}

async function main() {
    const token = process.env.AIRTABLE_PAT;
    if (!token) {
        throw new Error('AIRTABLE_PAT environment variable is required');
    }

    const rawRecords = await fetchAllRecords(token);
    const grants = rawRecords.map(normalizeGrantRecord);

    await writeFile(OUTPUT_PATH, `${JSON.stringify(grants, null, 4)}\n`);
    console.log(`Wrote ${grants.length} grants to ${OUTPUT_PATH.pathname}`);
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
