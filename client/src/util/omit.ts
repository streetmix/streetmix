/**
 * Replacement for lodash's omit().
 *
 * The opposite of _.pick; this method creates an object composed of the own
 * and inherited enumerable property paths of object that are not omitted.
 *
 * This is the vanilla JS implementation via
 * https://youmightnotneed.com/lodash/#omit
 *
 * WARNING: This is not a drop in replacement solution and it might not work
 * for some edge cases.
 */
export const omit = <T>(obj: T, props: string[]): Partial<T> => {
  // Create a clone of the original object
  obj = { ...obj }

  // For each property in `props`, delete it from cloned object
  // @ts-expect-error - It's safe to delete non-existent properties
  // Properties that are not found are a no-op.
  props.forEach((prop) => delete obj[prop])

  // Return final object
  return obj
}
