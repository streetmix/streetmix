import { SEGMENT_INFO } from './info'

const VARIANT_SEPARATOR = '|'

/**
 * Returns an object representing the segment variant, given the
 * segment type and a string representing what variant it is.
 * It breaks the variant string into parts by the VARIANT_SEPARATOR,
 * looks up the segment data, and assigns the string to a key name.
 * It does not validate data to make sure strings are valid.
 *
 * @param {string} segmentType - Name of the segment type, e.g. 'streetcar'
 * @param {string} variantString - String representation of segment variant, e.g. 'inbound|regular'
 * @returns {object} variantArray
 *    An object matching variant names to variant types, e.g.:
 *    { 'direction': 'inbound', 'public-transit-asphalt': 'regular' }
 */
export function getVariantArray (segmentType, variantString) {
  var variantArray = {}
  var variantSplit = variantString.split(VARIANT_SEPARATOR)

  for (var i in SEGMENT_INFO[segmentType].variants) {
    var variantName = SEGMENT_INFO[segmentType].variants[i]
    variantArray[variantName] = variantSplit[i]
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
  var string = ''
  for (var i in variant) {
    string += variant[i] + VARIANT_SEPARATOR
  }

  string = string.substr(0, string.length - 1)
  return string
}
