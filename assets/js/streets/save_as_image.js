var TRACK_ACTION_SAVE_AS_IMAGE = 'Save as image';

var SAVE_AS_IMAGE_DPI = 2.0;
var SAVE_AS_IMAGE_MIN_HEIGHT = 400;
var SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME = SAVE_AS_IMAGE_MIN_HEIGHT + 150;
var SAVE_AS_IMAGE_BOTTOM_PADDING = 60;
var SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING = 65;

function _getStreetImage(transparentSky, segmentNamesAndWidths, streetName) {
  var width = TILE_SIZE * street.width + BUILDING_SPACE * 2;

  var leftBuildingAttr = _getBuildingAttributes(street, true);
  var rightBuildingAttr = _getBuildingAttributes(street, false);

  var leftHeight = leftBuildingAttr.height;
  var rightHeight = rightBuildingAttr.height;

  var height = Math.max(leftHeight, rightHeight);
  if (height < SAVE_AS_IMAGE_MIN_HEIGHT) {
    height = SAVE_AS_IMAGE_MIN_HEIGHT;
  }

  if (streetName && (height < SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME)) {
    height = SAVE_AS_IMAGE_MIN_HEIGHT_WITH_STREET_NAME;
  }

  height += SAVE_AS_IMAGE_BOTTOM_PADDING;

  if (segmentNamesAndWidths) {
    height += SAVE_AS_IMAGE_NAMES_WIDTHS_PADDING;
  }

  var el = document.createElement('canvas');
  el.width = width * SAVE_AS_IMAGE_DPI;
  el.height = height * SAVE_AS_IMAGE_DPI;

  var ctx = el.getContext('2d');

  // TODO hack
  var oldDpi = system.hiDpi;
  system.hiDpi = SAVE_AS_IMAGE_DPI;
  _drawStreetThumbnail(ctx, street, width, height, 1.0, false, true, transparentSky, segmentNamesAndWidths, streetName);
  system.hiDpi = oldDpi;

  return el;
}

function _saveAsImagePreviewReady() {
  document.querySelector('#save-as-image-preview-loading').classList.remove('visible');
  document.querySelector('#save-as-image-preview-preview').classList.add('visible');
}

function _updateSaveAsImageDialogBox() {
  document.querySelector('#save-as-image-preview-loading').classList.add('visible');
  document.querySelector('#save-as-image-preview-preview').classList.remove('visible');

  window.setTimeout(_updateSaveAsImageDialogBoxPart2, 50);
}

function _updateSaveAsImageDialogBoxPart2() {
  document.querySelector('#save-as-image-preview-preview').innerHTML = '';

  var el = _getStreetImage(settings.saveAsImageTransparentSky, settings.saveAsImageSegmentNamesAndWidths, settings.saveAsImageStreetName);
  var dataUrl = el.toDataURL('image/png');

  var imgEl = document.createElement('img');
  imgEl.addEventListener('load', _saveAsImagePreviewReady);
  imgEl.src = dataUrl;
  document.querySelector('#save-as-image-preview-preview').appendChild(imgEl);

  var filename = _normalizeSlug(street.name);
  if (!filename) {
    filename = 'street';
  }
  filename += '.png';

  document.querySelector('#save-as-image-download').download = filename;
  document.querySelector('#save-as-image-download').href = dataUrl;
}

function _updateSaveAsImageOptions() {
  settings.saveAsImageTransparentSky =
      document.querySelector('#save-as-image-transparent-sky').checked;
  settings.saveAsImageSegmentNamesAndWidths =
      document.querySelector('#save-as-image-segment-names').checked;
  settings.saveAsImageStreetName =
      document.querySelector('#save-as-image-street-name').checked;

  _saveSettingsLocally();

  window.setTimeout(function() { _updateSaveAsImageDialogBox(); }, 0);
}

function _showSaveAsImageDialogBox(event) {
  _hideMenus();

  document.querySelector('#save-as-image-transparent-sky').checked =
      settings.saveAsImageTransparentSky;

  document.querySelector('#save-as-image-segment-names').checked =
      settings.saveAsImageSegmentNamesAndWidths;

  document.querySelector('#save-as-image-street-name').checked =
      settings.saveAsImageStreetName;

  document.querySelector('#save-as-image-preview-loading').classList.add('visible');
  document.querySelector('#save-as-image-preview-preview').classList.remove('visible');

  window.setTimeout(function() { _updateSaveAsImageDialogBox(); }, 100);

  document.querySelector('#save-as-image-dialog').classList.add('visible');
  document.querySelector('#dialog-box-shield').classList.add('visible');

  _eventTracking.track(TRACK_CATEGORY_SHARING, TRACK_ACTION_SAVE_AS_IMAGE, null, null, false);

  if (event) {
    event.preventDefault();
  }
}

function _hideSaveAsImageDialogBox() {
  document.querySelector('#save-as-image-dialog').classList.remove('visible');
  document.querySelector('#dialog-box-shield').classList.remove('visible');
}
