(function (Stmx) {

  var saveAsImageDialog = Stmx.ui.dialogs.define('saveAsImage', '#save-as-image-dialog', {
    clickSelector: '#save-as-image',
    trackCategory: TRACK_CATEGORY_SHARING,
    trackAction: 'Save as image',
    onInit: function () {
      document.querySelector('#save-as-image-transparent-sky').addEventListener('click', this._updateSaveAsImageOptions.bind(this));
      document.querySelector('#save-as-image-segment-names').addEventListener('click', this._updateSaveAsImageOptions.bind(this));
      document.querySelector('#save-as-image-street-name').addEventListener('click', this._updateSaveAsImageOptions.bind(this));
    },
    onShow: function () {
      document.querySelector('#save-as-image-transparent-sky').checked =
        settings.saveAsImageTransparentSky;

      document.querySelector('#save-as-image-segment-names').checked =
        settings.saveAsImageSegmentNamesAndWidths;

      document.querySelector('#save-as-image-street-name').checked =
        settings.saveAsImageStreetName;

      document.querySelector('#save-as-image-preview-loading').classList.add('visible');
      document.querySelector('#save-as-image-preview-preview').classList.remove('visible');

      window.setTimeout(this._updateSaveAsImageDialogBox.bind(this), 100);
    }
  });

  saveAsImageDialog._updateSaveAsImageDialogBox = function() {
    document.querySelector('#save-as-image-preview-loading').classList.add('visible');
    document.querySelector('#save-as-image-preview-preview').classList.remove('visible');

    window.setTimeout(this._updateSaveAsImageDialogBoxPart2.bind(this), 50);
  }

  saveAsImageDialog._updateSaveAsImageDialogBoxPart2 = function() {
    document.querySelector('#save-as-image-preview-preview').innerHTML = '';

    var el = _getStreetImage(settings.saveAsImageTransparentSky, settings.saveAsImageSegmentNamesAndWidths, settings.saveAsImageStreetName);
    var dataUrl = el.toDataURL('image/png');

    var imgEl = document.createElement('img');
    imgEl.addEventListener('load', this._saveAsImagePreviewReady.bind(this));
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

  saveAsImageDialog._saveAsImagePreviewReady = function() {
    document.querySelector('#save-as-image-preview-loading').classList.remove('visible');
    document.querySelector('#save-as-image-preview-preview').classList.add('visible');
  }

  saveAsImageDialog._updateSaveAsImageOptions = function() {
    settings.saveAsImageTransparentSky =
        document.querySelector('#save-as-image-transparent-sky').checked;
    settings.saveAsImageSegmentNamesAndWidths =
        document.querySelector('#save-as-image-segment-names').checked;
    settings.saveAsImageStreetName =
        document.querySelector('#save-as-image-street-name').checked;

    _saveSettingsLocally();

    window.setTimeout(this._updateSaveAsImageDialogBox.bind(this), 0);
  }

}(Stmx));
