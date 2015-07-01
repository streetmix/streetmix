var VARIANT_SEPARATOR = '|'

var VARIANTS = {
  'direction': ['inbound', 'outbound'],
  'parking-lane-direction': ['inbound', 'outbound', 'sideways'],

  'tree-type': ['big', 'palm-tree'],

  'lamp-orientation': ['left', 'both', 'right'],
  'lamp-type': ['modern', 'traditional'],

  'bench-orientation': ['left', 'center', 'right'],
  'turn-lane-orientation': ['left', 'left-straight', 'straight', 'right-straight', 'right', 'both', 'shared'],

  'divider-type': ['median', 'striped-buffer', 'planting-strip',
    'planter-box', 'bush', 'flowers', 'big-tree',
    'palm-tree', 'bollard', 'dome'],

  'orientation': ['left', 'right'],

  'public-transit-asphalt': ['regular', 'colored'],
  'bike-asphalt': ['regular', 'colored'],

  'transit-shelter-elevation': ['street-level', 'light-rail'],
  'bike-rack-elevation': ['sidewalk-parallel', 'sidewalk', 'road'],

  'car-type': ['car', 'sharrow', 'truck'],
  'sidewalk-density': ['dense', 'normal', 'sparse', 'empty'],

  'parking-lane-orientation': ['left', 'right'],
  'wayfinding-type': ['large', 'medium', 'small']
}

function _getVariantArray (segmentType, variantString) {
  var variantArray = {}
  var variantSplit = variantString.split(VARIANT_SEPARATOR)

  for (var i in SEGMENT_INFO[segmentType].variants) {
    var variantName = SEGMENT_INFO[segmentType].variants[i]

    variantArray[variantName] = variantSplit[i]
  }

  return variantArray
}

function _getVariantString (variant) {
  var string = ''
  for (var i in variant) {
    string += variant[i] + VARIANT_SEPARATOR
  }

  string = string.substr(0, string.length - 1)
  return string
}
