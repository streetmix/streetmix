var lastStreet;

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

var street = {
  schemaVersion: LATEST_SCHEMA_VERSION,

  id: null,
  creatorId: null,
  namespacedId: null,
  originalStreetId: null, // id of the street the current street is remixed from (could be null)
  name: null,
  editCount: null, // Since new street or remix · FIXME: can be null (meaning = don’t touch), but this will change

  width: null,
  occupiedWidth: null, // Can be recreated, do not save
  remainingWidth: null, // Can be recreated, do not save

  leftBuildingHeight: null,
  rightBuildingHeight: null,
  leftBuildingVariant: null,
  rightBuildingVariant: null,

  segments: [],

  units: null
};

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

function _createDomFromData() {
  document.querySelector('#street-section-editable').innerHTML = '';

  for (var i in street.segments) {
    var segment = street.segments[i];

    var el = _createSegmentDom(segment);
    document.querySelector('#street-section-editable').appendChild(el);

    segment.el = el;
    segment.el.dataNo = i;
  }

  _repositionSegments();
  _updateBuildingPosition();
  _createBuildings();
}

function _setStreetCreatorId(newId) {
  street.creatorId = newId;

  _unifyUndoStack();
  _updateLastStreetInfo();
}

function _setUpdateTimeToNow() {
  street.updatedAt = new Date().getTime();
  _unifyUndoStack();
  _updateStreetMetadata();
}

function _saveStreetToServerIfNecessary() {
  if (ignoreStreetChanges || abortEverything) {
    return;
  }

  var currentData = _trimStreetData(street);

  if (JSON.stringify(currentData) != JSON.stringify(lastStreet)) {
    if (street.editCount !== null) {
      street.editCount++;
      //console.log('increment editCount', street.editCount);
    } else {
      //console.log('not incrementing editCount since null');
    }
    _setUpdateTimeToNow();
    _hideWelcome();

    // As per issue #306.
    _statusMessage.hide();

    _updateStreetMetadata();

    _createNewUndoIfNecessary(lastStreet, currentData);

    _scheduleSavingStreetToServer();

    printingNeedsUpdating = true;
    lastStreet = currentData;

    _updateUndoButtons();
  }
}

// Copies only the data necessary for save/undo.
function _trimStreetData(street) {
  var newData = {};

  newData.schemaVersion = street.schemaVersion;

  newData.width = street.width;
  newData.name = street.name;

  newData.id = street.id;
  newData.namespacedId = street.namespacedId;
  newData.creatorId = street.creatorId;
  newData.originalStreetId = street.originalStreetId;
  newData.units = street.units;

  if (street.editCount !== null) {
    //console.log('saving editCount', street.editCount);
    newData.editCount = street.editCount;
  } else {
    //console.log('not saving editCount');
  }

  newData.leftBuildingHeight = street.leftBuildingHeight;
  newData.rightBuildingHeight = street.rightBuildingHeight;
  newData.leftBuildingVariant = street.leftBuildingVariant;
  newData.rightBuildingVariant = street.rightBuildingVariant;

  newData.segments = [];

  for (var i in street.segments) {
    var segment = {};
    segment.type = street.segments[i].type;
    segment.variantString = street.segments[i].variantString;
    segment.width = street.segments[i].width;
    if (street.segments[i].randSeed) {
      segment.randSeed = street.segments[i].randSeed;
    }

    newData.segments.push(segment);
  }

  return newData;
}

// TODO this function should not exist; all the data should be in street.
// object to begin with
function _createDataFromDom() {
  var els = document.querySelectorAll('#street-section-editable > .segment');

  street.segments = [];

  for (var i = 0, el; el = els[i]; i++) {
    var segment = {};
    segment.type = el.getAttribute('type');
    if (el.getAttribute('rand-seed')) {
      segment.randSeed = parseInt(el.getAttribute('rand-seed'));
    }
    segment.variantString = el.getAttribute('variant-string');
    segment.variant = _getVariantArray(segment.type, segment.variantString);
    segment.width = parseFloat(el.getAttribute('width'));
    segment.el = el;
    segment.warnings = [];
    street.segments.push(segment);
  }
}

function _fillDefaultSegments() {
  street.segments = [];

  for (var i in DEFAULT_SEGMENTS[leftHandTraffic]) {
    var segment = DEFAULT_SEGMENTS[leftHandTraffic][i];
    segment.warnings = [];
    segment.variantString = _getVariantString(segment.variant);

    if (SEGMENT_INFO[segment.type].needRandSeed) {
      segment.randSeed = _generateRandSeed();
    }

    street.segments.push(segment);
  }

  _normalizeAllSegmentWidths();
}

function _getStreetUrl(street) {
  var url = '/';

  if (street.creatorId) {
    if (RESERVED_URLS.indexOf(street.creatorId) != -1) {
      url += URL_RESERVED_PREFIX;
    }

    url += street.creatorId;
  } else {
    url += URL_NO_USER;
  }

  url += '/';

  url += street.namespacedId;

  if (street.creatorId) {
    var slug = _normalizeSlug(street.name);
    url += '/' + encodeURIComponent(slug);
  }

  return url;
}

function _prepareDefaultStreet() {
  street.units = units;
  _propagateUnits();
  street.name = DEFAULT_NAME;
  street.width = _normalizeStreetWidth(DEFAULT_STREET_WIDTH);
  street.leftBuildingHeight = DEFAULT_BUILDING_HEIGHT_LEFT;
  street.rightBuildingHeight = DEFAULT_BUILDING_HEIGHT_RIGHT;
  street.leftBuildingVariant = DEFAULT_BUILDING_VARIANT_LEFT;
  street.rightBuildingVariant = DEFAULT_BUILDING_VARIANT_RIGHT;
  street.editCount = 0;
  //console.log('editCount = 0 on default street');
  if (signedIn) {
    _setStreetCreatorId(signInData.userId);
  }

  _fillDefaultSegments();

  _setUpdateTimeToNow();
}

function _prepareEmptyStreet() {
  street.units = units;
  _propagateUnits();

  street.name = DEFAULT_NAME;
  street.width = _normalizeStreetWidth(DEFAULT_STREET_WIDTH);
  street.leftBuildingHeight = DEFAULT_BUILDING_HEIGHT_EMPTY;
  street.rightBuildingHeight = DEFAULT_BUILDING_HEIGHT_EMPTY;
  street.leftBuildingVariant = DEFAULT_BUILDING_VARIANT_EMPTY;
  street.rightBuildingVariant = DEFAULT_BUILDING_VARIANT_EMPTY;
  street.editCount = 0;
  //console.log('editCount = 0 on empty street!');
  if (signedIn) {
    _setStreetCreatorId(signInData.userId);
  }

  street.segments = [];

  _setUpdateTimeToNow();
}

function _updateEverything(dontScroll) {
  ignoreStreetChanges = true;
  _propagateUnits();
  _buildStreetWidthMenu();
  _updateShareMenu();
  _createDomFromData();
  _segmentsChanged();
  _resizeStreetWidth(dontScroll);
  _updateStreetName();
  ignoreStreetChanges = false;
  _updateUndoButtons();
  lastStreet = _trimStreetData(street);

  _scheduleSavingStreetToServer();
}
