var VARIANT_SEPARATOR = '|'

var VARIANTS = {
  'direction': ['inbound', 'outbound'],
  'parking-lane-direction': ['inbound', 'outbound', 'sideways'],

  'tree-type': ['big', 'palm-tree'],

  'lamp-orientation': ['left', 'both', 'right'],
  'lamp-type': ['modern', 'traditional', 'pride'],

  'bench-orientation': ['left', 'center', 'right'],
  'turn-lane-orientation': ['left', 'left-straight', 'straight', 'right-straight', 'right', 'both', 'shared'],

  'divider-type': ['median', 'striped-buffer', 'planting-strip',
    'planter-box', 'bush', 'flowers', 'big-tree',
    'palm-tree', 'bollard', 'dome'],

  'orientation': ['left', 'right'],

  'public-transit-asphalt': ['regular', 'colored'],
  'bus-asphalt': ['regular', 'colored', 'shared'],
  'bike-asphalt': ['regular', 'colored'],

  'transit-shelter-elevation': ['street-level', 'light-rail'],
  'bike-rack-elevation': ['sidewalk-parallel', 'sidewalk', 'road'],

  'car-type': ['car', 'sharrow', 'truck'],
  'sidewalk-density': ['dense', 'normal', 'sparse', 'empty'],

  'parking-lane-orientation': ['left', 'right'],
  'wayfinding-type': ['large', 'medium', 'small']
}

/**
 *  Returns an object representing the segment variant, given the
 *  segment type and a string representing what variant it is.
 *  It breaks the variant string into parts by the VARIANT_SEPARATOR,
 *  looks up the segment data, and assigns the string to a key name.
 *  It does not validate data to make sure strings are valid.
 *
 *  @param {string} segmentType - Name of the segment type, e.g. 'streetcar'
 *  @param {string} variantString - String representation of segment variant, e.g. 'inbound|regular'
 *  @returns {object} variantArray
 *    An object matching variant names to variant types, e.g.:
 *    { 'direction': 'inbound', 'public-transit-asphalt': 'regular' }
 */
function _getVariantArray (segmentType, variantString) {
  var variantArray = {}
  var variantSplit = variantString.split(VARIANT_SEPARATOR)

  for (var i in SEGMENT_INFO[segmentType].variants) {
    var variantName = SEGMENT_INFO[segmentType].variants[i]
    variantArray[variantName] = variantSplit[i]
  }

  return variantArray
}

/**
 *  Returns a string representing the segment variant.
 *  This is a simple transform, it does not validate against actual data.
 *  It assumes the parameter object is valid.
 *
 *  @param {object} variant
 *    Object whose keys are variant types and values are
 *    variant names, e.g.:
 *    { 'direction': 'inbound', 'public-transit-asphalt': 'regular' }
 *  @returns {string} string
 *    String representation of the variant, e.g.:
 *    'inbound|regular'
 */
function _getVariantString (variant) {
  var string = ''
  for (var i in variant) {
    string += variant[i] + VARIANT_SEPARATOR
  }

  string = string.substr(0, string.length - 1)
  return string
}
