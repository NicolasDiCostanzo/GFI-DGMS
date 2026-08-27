export function formatList(values: readonly string[]): string {
    return values.length > 0 ? values.join(', ') : 'Not specified';
}
