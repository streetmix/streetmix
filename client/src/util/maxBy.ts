/**
 * Replacement for lodash's maxBy().
 *
 * This method is like _.max except that it accepts iteratee which is
 * invoked for each element in array to generate the criterion by which
 * the value is ranked. The iteratee is invoked with one argument: (value).
 *
 * This is the vanilla JS implementation via
 * https://youmightnotneed.com/lodash/#maxBy
 * ... with some additions for ensuring type safety
 *
 * WARNING: This is not a drop in replacement solution and it might not work
 * for some edge cases.
 *
 * For instance: if not all objects in the array have the same properties,
 * this will fail to find the correct object.
 */

export function maxBy<T> (arr: T[], func: (arg: T) => unknown): T {
  const values = arr.map(func).filter((x) => typeof x === 'number')
  const max = Math.max(...values)
  const found = arr.find((item) => func(item) === max)

  if (found === undefined) {
    throw new Error('Could not find `maxBy` result in list')
  }

  return found
}
