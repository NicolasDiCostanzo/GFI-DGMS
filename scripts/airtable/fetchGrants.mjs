import { writeFile } from 'node:fs/promises';
import { normalizeGrantRecord } from './normalizeGrantRecord.mjs';

const BASE_ID = 'appbU29xVGtDvETSq';
const TABLE_ID = 'tbl17N1HQJVJFCsQU';
const OUTPUT_PATH = new URL(
    '../../src/sovereign/infrastructure/data/grants.json',
    import.meta.url,
);

async function fetchAllRecords(token) {
    const records = [];
    let offset;

    do {
        const url = new URL(`https://api.airtable.com/v0/${BASE_ID}/${TABLE_ID}`);
        url.searchParams.set('pageSize', '100');
        if (offset) {
            url.searchParams.set('offset', offset);
        }

        const response = await fetch(url, {
            headers: { Authorization: `Bearer ${token}` },
            signal: AbortSignal.timeout(30_000),
        });

        if (!response.ok) {
            throw new Error(
                `Airtable API request failed: ${response.status} ${response.statusText}`,
            );
        }

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
