export const INTERPOLATION_CASES: readonly [number, number, number, number][] = [
    [1000, 1000, 0, 0],
    [1000, 1000, 500, 500],
    [1000, 1000, 1000, 1000],
    [2000, 1000, 1000, 500],
    [2000, 1000, 2000, 1000],
    [1000, 333, 333, 111],
    [1000, 333, 999, 333],
];

export const CLAMPING_CASES: readonly [number, number, number][] = [
    [1000, 1500, 1000],
    [-500, 500, 0],
];
