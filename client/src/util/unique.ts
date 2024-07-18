/**
 * Replacement for lodash's uniq().
 *
 * Creates a duplicate-free version of an array, in which only the first
 * occurrence of each element is kept. The order of result values is
 * determined by the order they occur in the array.
 *
 * This is the vanilla JS implementation via
 * https://youmightnotneed.com/lodash/#uniq
 * (Using Array.from() instead of the spread operator)
 *
 * WARNING: This is not a drop in replacement solution and it might not work
 * for some edge cases.
 */
export function unique (arr: unknown[]): unknown[] {
  return Array.from(new Set(arr))
}
