import { validateNumeric } from '@/shared/utils/validateNumeric';
import { Country, CountryId } from '../../domain/Country';
import { CountryRepository } from '../../domain/repository/CountryRepository';
import { TargetBudget } from '../../domain/TargetBudget';
import countriesData from '../data/countries.json';
import { CountryDataValidationError } from '../errors/CountryDataValidationError';

export interface CountryRecord {
    id: string;
    name: string;
    baselineInvestment: number;
    targetBudget: number;
    jobMultiplier: number;
    co2Multiplier: number;
    currentNumberOfJobs: number;
    currentCO2Saved: number;
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
                const targetBudget = new TargetBudget(record.targetBudget);
                const country = new Country(
                    CountryId(record.id),
                    record.name,
                    record.baselineInvestment,
                    targetBudget,
                    record.jobMultiplier,
                    record.co2Multiplier,
                    record.currentNumberOfJobs,
                    record.currentCO2Saved,
                );
                return [country.id, country] as const;
            }),
        );
    }

    private validateNumericField(
        record: CountryRecord,
        index: number,
        fieldName:
            | 'baselineInvestment'
            | 'targetBudget'
            | 'jobMultiplier'
            | 'co2Multiplier'
            | 'currentNumberOfJobs'
            | 'currentCO2Saved',
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

            this.validateNumericField(record, index, 'jobMultiplier', record.jobMultiplier);

            this.validateNumericField(record, index, 'co2Multiplier', record.co2Multiplier);

            this.validateNumericField(
                record,
                index,
                'currentNumberOfJobs',
                record.currentNumberOfJobs,
            );

            this.validateNumericField(record, index, 'currentCO2Saved', record.currentCO2Saved);
        }
    }

    async findById(id: CountryId): Promise<Country | null> {
        return this.countries.get(id) ?? null;
    }

    async findAll(): Promise<Country[]> {
        return Array.from(this.countries.values());
    }
}
