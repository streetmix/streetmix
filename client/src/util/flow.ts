/**
 * Replacement for lodash's flow().
 *
 * Creates a function that returns the result of invoking the given functions
 * with the `this` binding of the created function, where each successive
 * invocation is supplied the return value of the previous.
 *
 * This is the vanilla JS implementation via
 * https://youmightnotneed.com/lodash/#flow
 *
 * WARNING: This is not a drop in replacement solution and it might not work
 * for some edge cases.
 *
 * @param funcs - array of functions
 * @returns Function
 */
export function flow<T extends unknown[], R> (
  funcs: Array<(...args: unknown[]) => unknown>
): (...args: T) => R {
  return (...args: T): R =>
    funcs.reduce((prev, fnc) => [fnc(...prev)], args)[0] as R
}
