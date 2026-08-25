export type CountryName = string & { readonly _brand: 'CountryName' };
export const CountryName = (name: string): CountryName => name as CountryName;
