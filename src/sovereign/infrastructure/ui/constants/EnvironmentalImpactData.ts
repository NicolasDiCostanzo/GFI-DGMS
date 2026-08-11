export interface LcaComparisonFigure {
    readonly meatType: 'beef' | 'pork' | 'chicken';
    readonly ghgReductionPercent: number;
    readonly landReductionPercent: number | null;
    readonly waterReductionPercent: number | null;
}

// Source: GFI, "Environmental benefits of alternative proteins"
// (gfi.org/initiatives/climate/environmental-benefits-of-alt-proteins/).
// Plant-based figures: LCAs from a variety of plant-based meat producers.
// null = not published on the source page for that meat type.
export const PLANT_BASED_LCA_FIGURES: readonly LcaComparisonFigure[] = [
    {
        meatType: 'beef',
        ghgReductionPercent: 90,
        landReductionPercent: 96,
        waterReductionPercent: 87,
    },
    {
        meatType: 'pork',
        ghgReductionPercent: 71,
        landReductionPercent: 41,
        waterReductionPercent: 81,
    },
    {
        meatType: 'chicken',
        ghgReductionPercent: 36,
        landReductionPercent: null,
        waterReductionPercent: 72,
    },
];

// Cultivated figures assume production with renewable energy — the source is explicit that
// this is required to achieve these reductions; without it, cultivated meat's footprint is
// substantially higher. Source: GFI's LCA of cultivated meat, conducted by CE Delft.
export const CULTIVATED_LCA_FIGURES: readonly LcaComparisonFigure[] = [
    {
        meatType: 'beef',
        ghgReductionPercent: 98,
        landReductionPercent: 94,
        waterReductionPercent: 84,
    },
    {
        meatType: 'pork',
        ghgReductionPercent: 80,
        landReductionPercent: 70,
        waterReductionPercent: null,
    },
    {
        meatType: 'chicken',
        ghgReductionPercent: 75,
        landReductionPercent: 61,
        waterReductionPercent: null,
    },
];
