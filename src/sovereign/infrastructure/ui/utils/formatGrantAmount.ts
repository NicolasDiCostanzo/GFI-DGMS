import { formatInvestment } from '@/sovereign/infrastructure/ui/utils/formatInvestment';

export function formatGrantAmount(amountUsd: number | null): string {
    return amountUsd === null ? 'Undisclosed' : formatInvestment(amountUsd / 1_000_000);
}
