import { describe, expect, it } from 'vitest';
import { resolveDominantProductionPillar } from './resolveDominantProductionPillar';
import {
    buildGrantWithPlatforms,
    PILLAR_CASES,
} from './resolveDominantProductionPillar.spec.fixtures';

describe('resolveDominantProductionPillar', () => {
    it.each(PILLAR_CASES)('returns %s for %s', (_title, platformsPerGrant, expected) => {
        const grants = platformsPerGrant.map((platforms) => buildGrantWithPlatforms(platforms));

        expect(resolveDominantProductionPillar(grants)).toBe(expected);
    });
});
