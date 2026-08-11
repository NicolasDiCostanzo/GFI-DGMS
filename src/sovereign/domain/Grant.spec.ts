import { describe, expect, it } from 'vitest';
import { Grant, GrantId } from './Grant';

describe('Grant', () => {
    const grant = new Grant(
        GrantId('recABC123'),
        'France',
        'Scaling cultivated foie gras production',
        5_000_000,
        ['Bpifrance', 'European Commission'],
        'Bpifrance and the European Commission',
        'Gourmey',
        'Funding to scale up bioreactor capacity.',
        'Commercialization',
        'Business Grant',
        ['Cultivated'],
        ['2024', '2025'],
        'https://example.com/announcement',
    );

    describe('constructor', () => {
        it('creates a Grant with all properties', () => {
            expect(grant.id).toBe('recABC123');
            expect(grant.country).toBe('France');
            expect(grant.projectTitle).toBe('Scaling cultivated foie gras production');
            expect(grant.amountUsd).toBe(5_000_000);
            expect(grant.funderAgencies).toEqual(['Bpifrance', 'European Commission']);
            expect(grant.funderName).toBe('Bpifrance and the European Commission');
            expect(grant.recipients).toBe('Gourmey');
            expect(grant.description).toBe('Funding to scale up bioreactor capacity.');
            expect(grant.aim).toBe('Commercialization');
            expect(grant.fundingInstrument).toBe('Business Grant');
            expect(grant.productionPlatforms).toEqual(['Cultivated']);
            expect(grant.yearsDisbursed).toEqual(['2024', '2025']);
            expect(grant.sourceUrl).toBe('https://example.com/announcement');
        });
    });
});
