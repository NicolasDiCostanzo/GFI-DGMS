import { describe, expect, it } from 'vitest';
import { normalizeGrantRecord } from './normalizeGrantRecord.mjs';
import {
    EXPECTED_FROM_FULL_RECORD,
    EXPECTED_FROM_MINIMAL_RECORD,
    FULL_RAW_RECORD,
    MINIMAL_RAW_RECORD,
} from './normalizeGrantRecord.spec.fixtures';

describe('normalizeGrantRecord', () => {
    it('maps every field from a fully populated raw record', () => {
        expect(normalizeGrantRecord(FULL_RAW_RECORD)).toEqual(EXPECTED_FROM_FULL_RECORD);
    });

    it('defaults missing optional fields to null or an empty array', () => {
        expect(normalizeGrantRecord(MINIMAL_RAW_RECORD)).toEqual(EXPECTED_FROM_MINIMAL_RECORD);
    });
});
