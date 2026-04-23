import Decimal from 'decimal.js';

Decimal.set({
  precision: 32,
  rounding: Decimal.ROUND_HALF_UP,
});

export { Decimal };

export type DecimalInput = Decimal.Value;

export const INTERNAL_DECIMAL_PLACES = 4;
export const MONEY_DECIMAL_PLACES = 2;
export const PERCENTAGE_DECIMAL_PLACES = 4;

export function toDecimal(value: DecimalInput): Decimal {
  return new Decimal(value);
}

export function zero(): Decimal {
  return toDecimal(0);
}

export function one(): Decimal {
  return toDecimal(1);
}

export function roundDecimal(
  value: DecimalInput,
  decimalPlaces = INTERNAL_DECIMAL_PLACES,
): Decimal {
  return toDecimal(value).toDecimalPlaces(decimalPlaces, Decimal.ROUND_HALF_UP);
}

export function roundInternal(value: DecimalInput): Decimal {
  return roundDecimal(value, INTERNAL_DECIMAL_PLACES);
}

export function roundMoney(value: DecimalInput): Decimal {
  return roundDecimal(value, MONEY_DECIMAL_PLACES);
}

export function formatDecimal(value: DecimalInput, decimalPlaces = INTERNAL_DECIMAL_PLACES): string {
  return roundDecimal(value, decimalPlaces).toFixed(decimalPlaces);
}

export function formatMoney(value: DecimalInput): string {
  return formatDecimal(value, MONEY_DECIMAL_PLACES);
}

export function formatPercentage(
  value: DecimalInput,
  decimalPlaces = PERCENTAGE_DECIMAL_PLACES,
): string {
  return formatDecimal(value, decimalPlaces);
}

export function sumDecimal(values: ReadonlyArray<DecimalInput>): Decimal {
  return values.reduce<Decimal>((total, value) => total.plus(toDecimal(value)), zero());
}
