import { Country, CountryId } from './Country';
import { TargetBudget } from './TargetBudget';

export const GERMANY = new Country(
    CountryId('276'),
    'Germany',
    500,
    new TargetBudget(1000),
    10,
    5,
    10000,
    5000,
);

export const FRANCE = new Country(
    CountryId('250'),
    'France',
    300,
    new TargetBudget(800),
    8,
    4,
    8000,
    4000,
);
