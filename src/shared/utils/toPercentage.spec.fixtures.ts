export const PERCENTAGE_CASES: ReadonlyArray<[title: string, fraction: number, expected: number]> =
    [
        ['converts a fraction to a rounded percentage', 0.5, 50],
        ['rounds to the nearest whole percentage', 0.756, 76],
        ['handles values above 1', 1.2, 120],
        ['handles zero', 0, 0],
    ];
