export const PRESERVE_ASPECT_RATIO_CASES: ReadonlyArray<
    [
        title: string,
        containerAspectRatio: number,
        mapAspectRatio: number,
        expected: 'meet' | 'slice',
    ]
> = [
    ['portrait mobile container far taller than the map', 0.475, 1.92, 'slice'],
    ['container aspect ratio slightly below the map ratio', 1.5, 1.92, 'slice'],
    ['square container', 1, 1.92, 'slice'],
    ['container aspect ratio equal to the map ratio', 1.92, 1.92, 'meet'],
    ['landscape desktop container wider than the map', 2.5, 1.92, 'meet'],
    ['ultra-wide container', 4, 1.92, 'meet'],
];
