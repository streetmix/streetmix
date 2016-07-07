/**
 * Save as Image (dialog box)
 *
 * Handles interaction on the "Save as image" dialog box.
 * Instantiates an instance of Dialog
 * Exports nothing
 *
 */
import React from 'react'
import Dialog from './Dialog'
import { trackEvent } from '../app/event_tracking'
import { getStreet } from '../streets/data_model'
import { getStreetImage } from '../streets/image'
import { saveSettingsLocally, getSettings } from '../users/settings'
import { normalizeSlug } from '../util/helpers'

// Require save-as polyfills
import saveAs from '../vendor/FileSaver'

export default class SaveAsImageDialog extends React.Component {
  constructor (props) {
    super(props)

    const settings = getSettings()
    this.state = {
      optionTransparentSky: settings.saveAsImageTransparentSky,
      optionSegmentNames: settings.saveAsImageSegmentNamesAndWidths,
      optionStreetName: settings.saveAsImageStreetName,
      isLoading: true,
      isShowingPreview: false,
      errorMessage: null,
      download: {
        filename: '',
        dataUrl: ''
      }
    }

    this.onChangeOptionTransparentSky = this.onChangeOptionTransparentSky.bind(this)
    this.onChangeOptionSegmentNames = this.onChangeOptionSegmentNames.bind(this)
    this.onChangeOptionStreetName = this.onChangeOptionStreetName.bind(this)
    this.updateOptions = this.updateOptions.bind(this)
    this.updatePreview = this.updatePreview.bind(this)
    this.onPreviewLoaded = this.onPreviewLoaded.bind(this)
    this.onClickDownloadImage = this.onClickDownloadImage.bind(this)
  }

  componentDidMount () {
    trackEvent('Sharing', 'Save as image', null, null, false)

    this.updatePreview()
  }

  onChangeOptionTransparentSky (event) {
    this.setState({ optionTransparentSky: event.target.checked })
    this.updateOptions()
  }

  onChangeOptionSegmentNames (event) {
    this.setState({ optionSegmentNames: event.target.checked })
    this.updateOptions()
  }

  onChangeOptionStreetName (event) {
    this.setState({ optionStreetName: event.target.checked })
    this.updateOptions()
  }

  onPreviewLoaded () {
    this.setState({ isLoading: false })
  }

  onPreviewError () {
    this.setState({
      isLoading: false,
      errorMessage: 'There was an error displaying a preview image.'
    })
  }

  /**
   * When download links are clicked, convert the dataURL to a blob for download.
   * Designed to get around a limitation in IE where a dataURL is not downloadable
   * directly (https://msdn.microsoft.com/en-us/library/cc848897(v=vs.85).aspx)
   */
  onClickDownloadImage (event) {
    event.preventDefault()
    this.imageCanvas.toBlob((blob) => {
      const filename = makeFilename()
      saveAs(blob, filename)
    })
  }

  updateOptions () {
    const settings = getSettings()
    settings.saveAsImageTransparentSky = this.state.optionTransparentSky
    settings.saveAsImageSegmentNamesAndWidths = this.state.optionSegmentNames
    settings.saveAsImageStreetName = this.state.optionStreetName

    saveSettingsLocally()

    this.setState({ isLoading: true })

    window.setTimeout(this.updatePreview, 50)
  }

  updatePreview () {
    const imageCanvas = this.imageCanvas = getStreetImage(this.state.optionTransparentSky, this.state.optionSegmentNames, this.state.optionStreetName)

    // .toDataURL is not available on IE11 when SVGs are part of the canvas.
    // The error in catch() should not appear on any of the newer evergreen browsers.
    try {
      const dataUrl = imageCanvas.toDataURL('image/png')
      this.setState({
        download: {
          filename: makeFilename(),
          dataUrl: dataUrl
        },
        errorMessage: null
      })
    } catch (e) {
      this.setState({
        errorMessage: 'Saving to image is not available on this browser.'
      })
    }
  }

  render () {
    return (
      <Dialog className='save-as-image-dialog'>
        <h1 data-i18n='dialogs.save.heading'>Save as image</h1>
        <p>
          <input
            type='checkbox'
            onChange={this.onChangeOptionSegmentNames}
            checked={this.state.optionSegmentNames}
            id='save-as-image-segment-names'
          />
          <label
            htmlFor='save-as-image-segment-names'
            data-i18n='dialogs.save.option-labels'>
            Segment names and widths
          </label>

          <input
            type='checkbox'
            onChange={this.onChangeOptionStreetName}
            checked={this.state.optionStreetName}
            id='save-as-image-street-name'
          />
          <label
            htmlFor='save-as-image-street-name'
            data-i18n='dialogs.save.option-name'>
            Street name
          </label>

          <input
            type='checkbox'
            onChange={this.onChangeOptionTransparentSky}
            checked={this.state.optionTransparentSky}
            id='save-as-image-transparent-sky'
          />
          <label
            htmlFor='save-as-image-transparent-sky'
            data-i18n='dialogs.save.option-sky'>
            Transparent sky
          </label>
        </p>
        {(() => {
          if (this.state.errorMessage) {
            return (
              <div id='save-as-image-preview'>
                <div className='save-as-image-preview-loading'>
                  {this.state.errorMessage}
                </div>
              </div>
            )
          } else {
            return (
              <div id='save-as-image-preview'>
                <div className='save-as-image-preview-loading' style={{display: this.state.isLoading ? 'block' : 'none'}}>
                  <span data-i18n='dialogs.save.loading'>Loading…</span>
                </div>
                <div className='save-as-image-preview-image' style={{display: this.state.isLoading ? 'none' : 'block'}}>
                  <img
                    src={this.state.download.dataUrl}
                    onLoad={this.onPreviewLoaded}
                    onError={this.onPreviewError}
                    alt='Preview'
                  />
                </div>
              </div>
            )
          }
        })()}
        <p>
          <a
            className='button-like'
            onClick={this.onClickDownloadImage}
            // Sets the anchor's `download` attribute so that it saves a meaningful filename
            // Note that this property is not supported in Safari/iOS
            download={this.state.download.filename}
            // Link should refer to data URL, even though onClickDownloadImage() is used for direct download
            href={this.state.download.dataUrl}
            data-i18n='dialogs.save.save-button'>
            Save to your computer…
          </a>
        </p>
        <footer data-i18n='dialogs.save.license'>
          This Streetmix-created image may be reused anywhere, for any purpose, under the
          <br /><a href='http://creativecommons.org/licenses/by-sa/4.0/'>Creative Commons Attribution-ShareAlike 4.0 International License</a>.
        </footer>
      </Dialog>
    )
  }
}

function makeFilename () {
  let filename = normalizeSlug(getStreet().name)
  if (!filename) {
    filename = 'street'
  }
  filename += '.png'

  return filename
}
