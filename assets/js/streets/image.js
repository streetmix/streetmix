var SAVE_AS_IMAGE_DPI = 2.0
var SAVE_AS_IMAGE_MIN_HEIGHT = 400
var SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME = SAVE_AS_IMAGE_MIN_HEIGHT + 150
var SAVE_AS_IMAGE_BOTTOM_PADDING = 60
var SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING = 65

_getStreetImage = function (transparentSky, segmentNamesAndWidths, streetName) {
  var width = TILE_SIZE * street.width + BUILDING_SPACE * 2

  var leftBuildingAttr = _getBuildingAttributes(street, true)
  var rightBuildingAttr = _getBuildingAttributes(street, false)

  var leftHeight = leftBuildingAttr.height
  var rightHeight = rightBuildingAttr.height

  var height = Math.max(leftHeight, rightHeight)
  if (height < SAVE_AS_IMAGE_MIN_HEIGHT) {
    height = SAVE_AS_IMAGE_MIN_HEIGHT
  }

  if (streetName && (height < SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME)) {
    height = SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME
  }

  height += SAVE_AS_IMAGE_BOTTOM_PADDING

  if (segmentNamesAndWidths) {
    height += SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING
  }

  var el = document.createElement('canvas')
  el.width = width * SAVE_AS_IMAGE_DPI
  el.height = height * SAVE_AS_IMAGE_DPI

  var ctx = el.getContext('2d')

  // TODO hack
  var oldDpi = system.hiDpi
  system.hiDpi = SAVE_AS_IMAGE_DPI
  _drawStreetThumbnail(ctx, street, width, height, 1.0, false, true, transparentSky, segmentNamesAndWidths, streetName)
  system.hiDpi = oldDpi

  return el
}
