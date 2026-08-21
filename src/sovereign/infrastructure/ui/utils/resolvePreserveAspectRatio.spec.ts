import { describe, expect, it } from 'vitest';
import { resolvePreserveAspectRatio } from './resolvePreserveAspectRatio';
import { PRESERVE_ASPECT_RATIO_CASES } from './resolvePreserveAspectRatio.spec.fixtures';

describe('resolvePreserveAspectRatio', () => {
    it.each(PRESERVE_ASPECT_RATIO_CASES)(
        'returns %s for %s',
        (_title, containerAspectRatio, mapAspectRatio, expected) => {
            expect(resolvePreserveAspectRatio(containerAspectRatio, mapAspectRatio)).toBe(expected);
        },
    );
});
