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
 *
 * @param {Array} arr - array of items to find the max value
 * @param {Function} func - selector function
 * @returns *
 */
export function maxBy (arr, func) {
  const max = Math.max(...arr.map(func))
  return arr.find((item) => func(item) === max)
}
