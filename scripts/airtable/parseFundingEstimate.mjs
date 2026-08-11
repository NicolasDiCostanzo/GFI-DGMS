const UNPARSEABLE_PREFIX = /^(undisclosed|unknown|unspecified)/i;
const RANGE_PATTERN = /\$[\d,.]+\s*(?:-|–|—|to|through)\s*\$?[\d,.]+/i;
const NON_USD_CURRENCY_PREFIX = /\b(?!USD\b)[A-Z]{3}\s*\$|€|£|¥/;
const DOLLAR_AMOUNT = /\$\s*([\d,]+(?:\.\d+)?)/;
const BARE_NUMBER = /^[\d,]+(?:\.\d+)?$/;

/**
 * Parses the free-text "Funding Estimate (USD)" Airtable field into a number.
 * Returns null when the value has no single disclosed USD amount (e.g. "Undisclosed",
 * a range, or a non-USD figure) rather than guessing at an approximation.
 */
export function parseFundingEstimate(raw) {
    if (raw === null || raw === undefined) {
        return null;
    }

    const trimmed = raw.trim();
    if (
        trimmed === '' ||
        UNPARSEABLE_PREFIX.test(trimmed) ||
        RANGE_PATTERN.test(trimmed) ||
        NON_USD_CURRENCY_PREFIX.test(trimmed)
    ) {
        return null;
    }

    const dollarMatch = trimmed.match(DOLLAR_AMOUNT);
    const rawAmount = dollarMatch ? dollarMatch[1] : BARE_NUMBER.test(trimmed) ? trimmed : null;
    if (rawAmount === null) {
        return null;
    }

    const amount = Number(rawAmount.replace(/,/g, ''));
    return Number.isFinite(amount) && amount > 0 ? amount : null;
}
