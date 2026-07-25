import { Currency } from '@/shared/types/Currency';
import { validateNumeric } from '@/shared/utils/validateNumeric';
import { CountryDataValidationError } from '../../app/errors/CountryDataValidationError';
import { Country, CountryId } from '../../domain/Country';
import { CountryRepository } from '../../domain/repository/CountryRepository';
import { TargetBudget } from '../../domain/TargetBudget';
import countriesData from '../data/countries.json';

export interface CountryRecord {
    id: string;
    name: string;
    baselineInvestment: number;
    targetBudget: number;
    currency: 'USD' | 'EUR';
    jobMultiplier: number;
    co2Multiplier: number;
}

export class StaticCountryRepository implements CountryRepository {
    private readonly countries: Map<CountryId, Country>;

    constructor(data?: CountryRecord[]) {
        const records = data ?? (countriesData as CountryRecord[]);

        if (!Array.isArray(records) || records.length === 0) {
            throw new Error('Country data file is missing or empty');
        }

        this.validateRecords(records);

        this.countries = new Map(
            records.map((record) => {
                const currency = record.currency === 'EUR' ? Currency.EUR() : Currency.USD();
                const targetBudget = new TargetBudget(record.targetBudget, currency);
                const country = new Country(
                    CountryId(record.id),
                    record.name,
                    record.baselineInvestment,
                    targetBudget,
                    record.jobMultiplier,
                    record.co2Multiplier,
                );
                return [country.id, country] as const;
            }),
        );
    }

    private validateNumericField(
        record: CountryRecord,
        index: number,
        fieldName: 'baselineInvestment' | 'targetBudget' | 'jobMultiplier' | 'co2Multiplier',
        value: unknown,
    ): void {
        if (typeof value !== 'number') {
            throw new CountryDataValidationError(
                `Invalid country record at index ${index} (id: ${record.id}): '${fieldName}' must be a number`,
            );
        }
        validateNumeric(
            value as number,
            `Country record at index ${index} (id: ${record.id})`,
            fieldName,
        );
    }

    private validateRecords(records: CountryRecord[]): void {
        for (let i = 0; i < records.length; i++) {
            const record = records[i];
            const index = i + 1;

            if (typeof record.id !== 'string' || record.id.trim() === '') {
                throw new CountryDataValidationError(
                    `Invalid country record at index ${index}: 'id' must be a non-empty string`,
                );
            }

            if (typeof record.name !== 'string' || record.name.trim() === '') {
                throw new CountryDataValidationError(
                    `Invalid country record at index ${index} (id: ${record.id}): 'name' must be a non-empty string`,
                );
            }

            this.validateNumericField(
                record,
                index,
                'baselineInvestment',
                record.baselineInvestment,
            );

            this.validateNumericField(record, index, 'targetBudget', record.targetBudget);

            if (record.currency !== 'USD' && record.currency !== 'EUR') {
                throw new CountryDataValidationError(
                    `Invalid country record at index ${index} (id: ${record.id}): 'currency' must be either 'USD' or 'EUR', got '${record.currency}'`,
                );
            }

            this.validateNumericField(record, index, 'jobMultiplier', record.jobMultiplier);

            this.validateNumericField(record, index, 'co2Multiplier', record.co2Multiplier);
        }
    }

    async findById(id: CountryId): Promise<Country | null> {
        return this.countries.get(id) ?? null;
    }

    async findAll(): Promise<Country[]> {
        return Array.from(this.countries.values());
    }
}
