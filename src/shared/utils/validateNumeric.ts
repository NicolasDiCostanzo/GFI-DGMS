import { InfiniteNumberException } from '@/shared/errors/InfiniteNumberException';
import { InvalidNumberException } from '@/shared/errors/InvalidNumberException';

export function validateNumeric(value: number, context: string, paramName: string): void {
    if (Number.isNaN(value)) {
        throw new InvalidNumberException(`${context} ${paramName} must not be NaN`);
    }
    if (!Number.isFinite(value)) {
        throw new InfiniteNumberException(`${context} ${paramName} must be finite`);
    }
}
