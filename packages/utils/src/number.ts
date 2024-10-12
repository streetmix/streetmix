/**
 * Given a string indicating a percentage (e.g. `65%`) returns its numerical
 * value, e.g. `0.65`
 */
export function percentToNumber (percent: string): number {
  return Number.parseFloat(percent) / 100
}

/**
 * Rounds a number to a maximum number of decimals, fixing floating point
 * errors. See https://www.jacklmoore.com/notes/rounding-in-javascript/
 */
export function round (value: number, decimals: number = 0): number {
  // Exponents using string notation does not satisfy the type-checker, so
  // these values must be cast to Number type before usage.
  // I did attempt trying exponentiation operators, but that still produces
  // rounding errors.
  return Number(Math.round(Number(value + 'e' + decimals)) + 'e-' + decimals)
}
