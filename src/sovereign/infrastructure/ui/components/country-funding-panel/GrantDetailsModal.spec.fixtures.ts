import type { ThemeMode } from '@/sovereign/domain/constants/MapColors';
import { Grant, GrantId } from '@/sovereign/domain/Grant';

export const BASE_GRANT = new Grant(
    GrantId('rec-modal'),
    'France',
    'Solar Grid Expansion',
    5_000_000,
    ['Green Energy Agency'],
    'Green Energy Fund',
    'Solar Grid Co.',
    'Funding for renewable infrastructure upgrades.',
    'Commercialization',
    'Business Grant',
    ['Plant-based'],
    ['2024', '2025'],
    'https://example.com/grant',
);

export const BASE_PROPS = {
    open: true,
    grant: BASE_GRANT,
    sourceUrl: 'https://example.com/grant',
    themeMode: 'light' as ThemeMode,
};
