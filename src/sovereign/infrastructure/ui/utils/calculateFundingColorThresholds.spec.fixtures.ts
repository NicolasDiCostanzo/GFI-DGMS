export const THRESHOLD_CASES: ReadonlyArray<[title: string, totals: number[], expected: number[]]> =
    [
        ['no totals at all', [], []],
        ['only zero totals', [0, 0], []],
        ['a single positive total', [100], [100, 100, 100, 100]],
        [
            'ten evenly spaced totals, ignoring zeros',
            [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
            [30, 50, 70, 90],
        ],
    ];
