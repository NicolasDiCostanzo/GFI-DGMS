export function validateSourceUrl(sourceUrl: string | null): string | null {
    if (!sourceUrl) {
        return null;
    }
    try {
        const url = new URL(sourceUrl);
        return url.protocol === 'http:' || url.protocol === 'https:' ? url.href : null;
    } catch {
        return null;
    }
}
