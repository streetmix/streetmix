/**
 *  Save as Image (dialog box)
 *
 *  Handles interaction on the "Save as image" dialog box.
 *  Instantiates an instance of Dialog
 *  Exports nothing
 *
 */
(function () {
  /* global DialogManager, EventTracking */
  /* global TRACK_CATEGORY_SHARING */
  /* global street, settings, _saveSettingsLocally, _normalizeSlug, _getStreetImage */
  'use strict'

  // Cached references to elements
  var _elTransparentSky, _elSegmentNames, _elStreetName, _elPreviewLoading, _elPreviewPreview, _elDownloadLink

  DialogManager.define('saveAsImage', '#save-as-image-dialog', {
    clickSelector: '#save-as-image',
    onInit: function () {
      _elTransparentSky = this.el.querySelector('#save-as-image-transparent-sky')
      _elSegmentNames = this.el.querySelector('#save-as-image-segment-names')
      _elStreetName = this.el.querySelector('#save-as-image-street-name')
      _elPreviewLoading = this.el.querySelector('#save-as-image-preview-loading')
      _elPreviewPreview = this.el.querySelector('#save-as-image-preview-preview')
      _elDownloadLink = this.el.querySelector('#save-as-image-download')

      _elTransparentSky.addEventListener('click', _updateSaveAsImageOptions)
      _elSegmentNames.addEventListener('click', _updateSaveAsImageOptions)
      _elStreetName.addEventListener('click', _updateSaveAsImageOptions)
    },
    onShow: function () {
      _elTransparentSky.checked = settings.saveAsImageTransparentSky
      _elSegmentNames.checked = settings.saveAsImageSegmentNamesAndWidths
      _elStreetName.checked = settings.saveAsImageStreetName

      _elPreviewLoading.classList.add('visible')
      _elPreviewPreview.classList.remove('visible')

      window.setTimeout(_updateSaveAsImageDialogBox, 100)

      // Tracking
      EventTracking.track(TRACK_CATEGORY_SHARING, 'Save as image', null, null, false)
    }
  })

  // 'Private' functions

  function _updateSaveAsImageDialogBox () {
    _elPreviewLoading.classList.add('visible')
    _elPreviewPreview.classList.remove('visible')

    window.setTimeout(_updateSaveAsImageDialogBoxPart2, 50)
  }

  function _updateSaveAsImageDialogBoxPart2 () {
    _elPreviewPreview.innerHTML = ''

    var el = _getStreetImage(settings.saveAsImageTransparentSky, settings.saveAsImageSegmentNamesAndWidths, settings.saveAsImageStreetName)
    var dataUrl = el.toDataURL('image/png')

    var imgEl = document.createElement('img')
    imgEl.addEventListener('load', _saveAsImagePreviewReady)
    imgEl.src = dataUrl
    _elPreviewPreview.appendChild(imgEl)

    var filename = _normalizeSlug(street.name)
    if (!filename) {
      filename = 'street'
    }
    filename += '.png'

    _elDownloadLink.download = filename // Not supported in Safari and IE
    _elDownloadLink.href = dataUrl // Not supported in IE for "security reasons" - https://msdn.microsoft.com/en-us/library/cc848897(v=vs.85).aspx
  }

  function _saveAsImagePreviewReady () {
    _elPreviewLoading.classList.remove('visible')
    _elPreviewPreview.classList.add('visible')
  }

  function _updateSaveAsImageOptions () {
    settings.saveAsImageTransparentSky = _elTransparentSky.checked
    settings.saveAsImageSegmentNamesAndWidths = _elSegmentNames.checked
    settings.saveAsImageStreetName = _elStreetName.checked

    _saveSettingsLocally()

    window.setTimeout(_updateSaveAsImageDialogBox, 0)
  }

})()
