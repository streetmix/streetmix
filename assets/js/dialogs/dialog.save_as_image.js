Stmx.ui.dialogs.instances.saveAsImage = new Stmx.ui.Dialog('#save-as-image-dialog', {
  trackCategory: TRACK_CATEGORY_SHARING,
  trackAction: 'Save as image',
  onShow: function () {
    document.querySelector('#save-as-image-transparent-sky').checked =
      settings.saveAsImageTransparentSky;

    document.querySelector('#save-as-image-segment-names').checked =
      settings.saveAsImageSegmentNamesAndWidths;

    document.querySelector('#save-as-image-street-name').checked =
      settings.saveAsImageStreetName;

    document.querySelector('#save-as-image-preview-loading').classList.add('visible');
    document.querySelector('#save-as-image-preview-preview').classList.remove('visible');

    window.setTimeout(function() { _updateSaveAsImageDialogBox(); }, 100);
  }
});

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
