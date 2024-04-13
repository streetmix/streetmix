import { getSegmentInfo } from './info'

const VARIANT_SEPARATOR = '|'

/**
 * Returns an object representing the segment variant, given the
 * segment type and a string representing what variant it is.
 * It breaks the variant string into parts by the VARIANT_SEPARATOR,
 * looks up the segment data, and assigns the string to a key name.
 * It does not validate data to make sure strings are valid.
 *
 * If the `segmentType` cannot be found, returns the empty object.
 *
 * @param {string} segmentType - Name of the segment type, e.g. 'streetcar'
 * @param {string} variantString - String representation of segment variant, e.g. 'inbound|regular'
 * @returns {object} variantArray
 *    An object matching variant names to variant types, e.g.:
 *    { 'direction': 'inbound', 'public-transit-asphalt': 'regular' }
 */
export function getVariantArray (segmentType, variantString) {
  const variantArray = {}
  const variantSplit = variantString.split(VARIANT_SEPARATOR)
  const segment = getSegmentInfo(segmentType)

  if (segment && segment.variants) {
    for (const i in segment.variants) {
      const variantName = segment.variants[i]
      variantArray[variantName] = variantSplit[i]
    }
  }

  return variantArray
}

/**
 * Returns a string representing the segment variant.
 * This is a simple transform, it does not validate against actual data.
 * It assumes the parameter object is valid.
 *
 * @param {object} variant
 *    Object whose keys are variant types and values are
 *    variant names, e.g.:
 *    { 'direction': 'inbound', 'public-transit-asphalt': 'regular' }
 * @returns {string} string
 *    String representation of the variant, e.g.:
 *    'inbound|regular'
 */
export function getVariantString (variant) {
  return Object.values(variant).join(VARIANT_SEPARATOR)
}
