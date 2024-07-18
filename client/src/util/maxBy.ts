/**
 * Replacement for lodash's maxBy().
 *
 * This method is like _.max except that it accepts iteratee which is
 * invoked for each element in array to generate the criterion by which
 * the value is ranked. The iteratee is invoked with one argument: (value).
 *
 * This is the vanilla JS implementation via
 * https://youmightnotneed.com/lodash/#maxBy
 *
 * WARNING: This is not a drop in replacement solution and it might not work
 * for some edge cases.
 *
 * For instance: if not all objects in the array have the same properties,
 * this will fail to find the correct object.
 */

export function maxBy (
  arr: Array<Record<string, unknown>>,
  func: (arg: Record<string, unknown>) => number
): Record<string, unknown> | undefined {
  const max = Math.max(...arr.map(func))
  return arr.find((item) => func(item) === max)
}
