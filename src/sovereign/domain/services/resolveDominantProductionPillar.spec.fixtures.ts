import { CountryName } from '@/sovereign/domain/CountryName';
import { Grant, GrantId } from '@/sovereign/domain/Grant';

let nextId = 1;

export function buildGrantWithPlatforms(productionPlatforms: string[]): Grant {
    return new Grant(
        GrantId(`rec${nextId++}`),
        CountryName('France'),
        'Untitled grant',
        null,
        [],
        null,
        null,
        null,
        null,
        null,
        productionPlatforms,
        [],
        null,
    );
}

export const PILLAR_CASES: ReadonlyArray<
    [title: string, platformsPerGrant: string[][], expected: 'Plant-based' | 'Cultivated' | null]
> = [
    ['no grants', [], null],
    ['a single grant with no production platform tagged', [[]], null],
    [
        'plant-based grants outnumbering cultivated ones',
        [['Plant-based'], ['Plant-based'], ['Cultivated']],
        'Plant-based',
    ],
    [
        'cultivated grants outnumbering plant-based ones',
        [['Cultivated'], ['Cultivated'], ['Plant-based']],
        'Cultivated',
    ],
    ['an exact tie between the two pillars', [['Plant-based'], ['Cultivated']], null],
    [
        'only fermentation-tagged grants (no comparison data for either pillar)',
        [['Fermentation']],
        null,
    ],
    [
        'near-duplicate plant-based spellings all counted together',
        [['Plant-Based'], ['Plant-based meat']],
        'Plant-based',
    ],
    ['a combined "PB & CM" value counting toward both pillars', [['PB & CM']], null],
    [
        'a combined "PB & CM" value tipping a tie toward plant-based',
        [['PB & CM'], ['Plant-based']],
        'Plant-based',
    ],
    ['an "All" value counting toward both pillars', [['All']], null],
];
