export function resolvePreserveAspectRatio(
    containerAspectRatio: number,
    mapAspectRatio: number,
): 'meet' | 'slice' {
    return containerAspectRatio < mapAspectRatio ? 'slice' : 'meet';
}
