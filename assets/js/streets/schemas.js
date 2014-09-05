var LATEST_SCHEMA_VERSION = 16;
// 1: starting point
// 2: adding leftBuildingHeight and rightBuildingHeight
// 3: adding leftBuildingVariant and rightBuildingVariant
// 4: adding transit shelter elevation
// 5: adding another lamp type (traditional)
// 6: colored streetcar lanes
// 7: colored bus and light rail lanes
// 8: colored bike lane
// 9: second car type: truck
// 10: sidewalk density
// 11: unify median and planting strip into divider
// 12: getting rid of small tree
// 13: bike rack elevation
// 14: wayfinding has three types
// 15: sidewalks have rand seed
// 16: stop saving undo stack

function _incrementSchemaVersion(street) {
  if (!street.schemaVersion) {
    street.schemaVersion = 1;
  }

  switch (street.schemaVersion) {
    case 1:
      street.leftBuildingHeight = DEFAULT_BUILDING_HEIGHT_LEFT;
      street.rightBuildingHeight = DEFAULT_BUILDING_HEIGHT_RIGHT;
      break;
    case 2:
      street.leftBuildingVariant = DEFAULT_BUILDING_VARIANT_LEFT;
      street.rightBuildingVariant = DEFAULT_BUILDING_VARIANT_RIGHT;
      break;
    case 3:
      for (var i in street.segments) {
        var segment = street.segments[i];
        if (segment.type == 'transit-shelter') {
          var variant = _getVariantArray(segment.type, segment.variantString);
          variant['transit-shelter-elevation'] = 'street-level';
          segment.variantString = _getVariantString(variant);
        }
      }
      break;
    case 4:
      for (var i in street.segments) {
        var segment = street.segments[i];
        if (segment.type == 'sidewalk-lamp') {
          var variant = _getVariantArray(segment.type, segment.variantString);
          variant['lamp-type'] = 'modern';
          segment.variantString = _getVariantString(variant);
        }
      }
      break;
    case 5:
      for (var i in street.segments) {
        var segment = street.segments[i];
        if (segment.type == 'streetcar') {
          var variant = _getVariantArray(segment.type, segment.variantString);
          variant['public-transit-asphalt'] = 'regular';
          segment.variantString = _getVariantString(variant);
        }
      }
      break;
    case 6:
      for (var i in street.segments) {
        var segment = street.segments[i];
        if ((segment.type == 'bus-lane') || (segment.type == 'light-rail')) {
          var variant = _getVariantArray(segment.type, segment.variantString);
          variant['public-transit-asphalt'] = 'regular';
          segment.variantString = _getVariantString(variant);
        }
      }
      break;
    case 7:
      for (var i in street.segments) {
        var segment = street.segments[i];
        if (segment.type == 'bike-lane') {
          var variant = _getVariantArray(segment.type, segment.variantString);
          variant['bike-asphalt'] = 'regular';
          segment.variantString = _getVariantString(variant);
        }
      }
      break;
    case 8:
      for (var i in street.segments) {
        var segment = street.segments[i];
        if (segment.type == 'drive-lane') {
          var variant = _getVariantArray(segment.type, segment.variantString);
          variant['car-type'] = 'car';
          segment.variantString = _getVariantString(variant);
        }
      }
      break;
    case 9:
      for (var i in street.segments) {
        var segment = street.segments[i];
        if (segment.type == 'sidewalk') {
          var variant = _getVariantArray(segment.type, segment.variantString);
          variant['sidewalk-density'] = 'normal';
          segment.variantString = _getVariantString(variant);
        }
      }
      break;
    case 10:
      for (var i in street.segments) {
        var segment = street.segments[i];
        if (segment.type == 'planting-strip') {
          segment.type = 'divider';

          if (segment.variantString == '') {
            segment.variantString = 'planting-strip';
          };
        } else if (segment.type == 'small-median') {
          segment.type = 'divider';
          segment.variantString = 'median';
        }
      }
      break;
    case 11:
      for (var i in street.segments) {
        var segment = street.segments[i];
        if (segment.type == 'divider') {
          if (segment.variantString == 'small-tree') {
            segment.variantString = 'big-tree';
          };
        } else if (segment.type == 'sidewalk-tree') {
          if (segment.variantString == 'small') {
            segment.variantString = 'big';
          };
        }
      }
      break;
    case 12:
      for (var i in street.segments) {
        var segment = street.segments[i];
        if (segment.type == 'sidewalk-bike-rack') {
          var variant = _getVariantArray(segment.type, segment.variantString);
          variant['bike-rack-elevation'] = 'sidewalk';
          segment.variantString =  _getVariantString(variant);
        }
      }
      break;
    case 13:
      for (var i in street.segments) {
        var segment = street.segments[i];
        if (segment.type == 'sidewalk-wayfinding') {
          var variant = _getVariantArray(segment.type, segment.variantString);
          variant['wayfinding-type'] = 'large';
          segment.variantString =  _getVariantString(variant);
        }
      }
      break;
    case 14:
      for (var i in street.segments) {
        var segment = street.segments[i];
        if (segment.type == 'sidewalk') {
          segment.randSeed = 35;
        }
      }
      break;
    case 15:
      undoStack = [];
      undoPosition = 0;
      break;
  }

  street.schemaVersion++;
}

function _updateToLatestSchemaVersion(street) {
  var updated = false;
  while (!street.schemaVersion || (street.schemaVersion < LATEST_SCHEMA_VERSION)) {
    _incrementSchemaVersion(street);
    updated = true;
  }

  return updated;
}
