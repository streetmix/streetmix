/**
 * Save as Image (dialog box)
 *
 * Handles interaction on the "Save as image" dialog box.
 * Instantiates an instance of Dialog
 * Exports nothing
 *
 */

import Dialog from './dialog'
import { trackEvent } from '../app/event_tracking'
import { getStreet } from '../streets/data_model'
import { getStreetImage } from '../streets/image'
import { saveSettingsLocally, getSettings } from '../users/settings'
import { normalizeSlug } from '../util/helpers'

// Require save-as polyfills
import saveAs from '../vendor/FileSaver'
import '../vendor/canvas-toBlob.js'
import '../vendor/Blob.js'

// Cache references to elements
const _elTransparentSky = document.getElementById('save-as-image-transparent-sky')
const _elSegmentNames = document.getElementById('save-as-image-segment-names')
const _elStreetName = document.getElementById('save-as-image-street-name')
const _elPreviewLoading = document.getElementById('save-as-image-preview-loading')
const _elPreviewPreview = document.getElementById('save-as-image-preview-preview')
const _elDownloadLink = document.getElementById('save-as-image-download')

let imageCanvas

export let saveAsImageDialog = new Dialog('#save-as-image-dialog', {
  clickSelector: '#save-as-image',
  onInit: function () {
    _elTransparentSky.addEventListener('change', _updateSaveAsImageOptions)
    _elSegmentNames.addEventListener('change', _updateSaveAsImageOptions)
    _elStreetName.addEventListener('change', _updateSaveAsImageOptions)

    _elDownloadLink.addEventListener('click', _downloadImage)
  },
  onShow: function () {
    let settings = getSettings()
    _elTransparentSky.checked = settings.saveAsImageTransparentSky
    _elSegmentNames.checked = settings.saveAsImageSegmentNamesAndWidths
    _elStreetName.checked = settings.saveAsImageStreetName

    _elPreviewLoading.classList.add('visible')
    _elPreviewPreview.classList.remove('visible')

    window.setTimeout(_updateSaveAsImageDialogBox, 100)

    // Tracking
    trackEvent('Sharing', 'Save as image', null, null, false)
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
  let settings = getSettings()
  imageCanvas = getStreetImage(settings.saveAsImageTransparentSky, settings.saveAsImageSegmentNamesAndWidths, settings.saveAsImageStreetName)

  try {
    const dataUrl = imageCanvas.toDataURL('image/png')
    const imgEl = document.createElement('img')

    imgEl.addEventListener('load', _saveAsImagePreviewReady)
    imgEl.src = dataUrl
    _elPreviewPreview.appendChild(imgEl)

    _elDownloadLink.download = _makeFilename() // Not supported in Safari/iOS
    _elDownloadLink.href = dataUrl // Link should refer to data URL, even though
                                   // _downloadImage() is used for direct download
  } catch (e) {
    // .toDataURL is not available on IE11 when SVGs are part of the canvas.
    // This should not appear on any of the newer evergreen browsers.
    _elPreviewLoading.textContent = 'Saving to image is not available on this browser.'
  }
}

function _saveAsImagePreviewReady () {
  _elPreviewLoading.classList.remove('visible')
  _elPreviewPreview.classList.add('visible')
}

function _updateSaveAsImageOptions () {
  let settings = getSettings()
  settings.saveAsImageTransparentSky = _elTransparentSky.checked
  settings.saveAsImageSegmentNamesAndWidths = _elSegmentNames.checked
  settings.saveAsImageStreetName = _elStreetName.checked

  saveSettingsLocally()

  window.setTimeout(_updateSaveAsImageDialogBox, 0)
}

/**
 *  When download links is clicked, converts the dataURL to a blob for download
 *  Designed to get around a limitation in IE where a dataURL is not downloadable directly (https://msdn.microsoft.com/en-us/library/cc848897(v=vs.85).aspx)
 */
function _downloadImage (event) {
  event.preventDefault()
  imageCanvas.toBlob(function (blob) {
    const filename = _makeFilename()
    saveAs(blob, filename)
  })
}

function _makeFilename () {
  let filename = normalizeSlug(getStreet().name)
  if (!filename) {
    filename = 'street'
  }
  filename += '.png'

  return filename
}
