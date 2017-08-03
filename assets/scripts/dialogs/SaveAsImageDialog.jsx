/**
 * Save as Image (dialog box)
 *
 * Handles interaction on the "Save as image" dialog box.
 * Instantiates an instance of Dialog
 * Exports nothing
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { isEqual } from 'lodash'
import Dialog from './Dialog'
import { trackEvent } from '../app/event_tracking'
import { getStreet } from '../streets/data_model'
import { getStreetImage } from '../streets/image'
import { setSettings } from '../users/settings'
import { normalizeSlug } from '../util/helpers'
import { t } from '../app/locale'

// Require save-as polyfills
import { saveAs } from 'file-saver'

class SaveAsImageDialog extends React.Component {
  constructor (props) {
    super(props)

    this.state = {
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
    this.updatePreview = this.updatePreview.bind(this)
    this.onPreviewLoaded = this.onPreviewLoaded.bind(this)
    this.onClickDownloadImage = this.onClickDownloadImage.bind(this)
  }

  componentDidMount () {
    trackEvent('Sharing', 'Save as image', null, null, false)

    this.updatePreview()
  }

  componentWillReceiveProps (nextProps) {
    // When props change, update image.
    if (isEqual(nextProps, this.props) === false) {
      this.setState({ isLoading: true })

      // Update preview when props change; make a slight delay because there is
      // a slight lag on image creation, but it's so short it feels weird.
      // Time delay makes the "Loading" feel "right."
      window.setTimeout(() => {
        this.updatePreview()
      }, 50)
    }
  }

  // When options change, this changes props.
  onChangeOptionTransparentSky (event) {
    setSettings({ saveAsImageTransparentSky: event.target.checked })
  }

  onChangeOptionSegmentNames (event) {
    setSettings({ saveAsImageSegmentNamesAndWidths: event.target.checked })
  }

  onChangeOptionStreetName (event) {
    setSettings({ saveAsImageStreetName: event.target.checked })
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

  updatePreview () {
    this.imageCanvas = getStreetImage(this.props.transparentSky, this.props.segmentNames, this.props.streetName)

    // .toDataURL is not available on IE11 when SVGs are part of the canvas.
    // The error in catch() should not appear on any of the newer evergreen browsers.
    try {
      const dataUrl = this.imageCanvas.toDataURL('image/png')
      this.setState({
        download: {
          filename: makeFilename(),
          dataUrl: dataUrl
        },
        errorMessage: null
      })
    } catch (e) {
      this.setState({
        errorMessage: t('dialogs.save.error-unavailable', 'Saving to image is not available on this browser.')
      })
    }
  }

  render () {
    return (
      <Dialog className='save-as-image-dialog'>
        <h1>{t('dialogs.save.heading', 'Save as image')}</h1>
        <p>
          <input
            type='checkbox'
            onChange={this.onChangeOptionSegmentNames}
            checked={this.props.segmentNames}
            id='save-as-image-segment-names'
          />
          <label htmlFor='save-as-image-segment-names'>
            {t('dialogs.save.option-labels', 'Segment names and widths')}
          </label>

          <input
            type='checkbox'
            onChange={this.onChangeOptionStreetName}
            checked={this.props.streetName}
            id='save-as-image-street-name'
          />
          <label htmlFor='save-as-image-street-name'>
            {t('dialogs.save.option-name', 'Street name')}
          </label>

          <input
            type='checkbox'
            onChange={this.onChangeOptionTransparentSky}
            checked={this.props.transparentSky}
            id='save-as-image-transparent-sky'
          />
          <label htmlFor='save-as-image-transparent-sky'>
            {t('dialogs.save.option-sky', 'Transparent sky')}
          </label>
        </p>
        {(() => {
          if (this.state.errorMessage) {
            return (
              <div className='save-as-image-preview'>
                <div className='save-as-image-preview-loading'>
                  {this.state.errorMessage}
                </div>
              </div>
            )
          } else {
            return (
              <div className='save-as-image-preview'>
                <div className='save-as-image-preview-loading' style={{display: this.state.isLoading ? 'block' : 'none'}}>
                  {t('dialogs.save.loading', 'Loading…')}
                </div>
                <div className='save-as-image-preview-image' style={{display: this.state.isLoading ? 'none' : 'block'}}>
                  <img
                    src={this.state.download.dataUrl}
                    onLoad={this.onPreviewLoaded}
                    onError={this.onPreviewError}
                    alt={t('dialogs.save.preview-image-alt', 'Preview')}
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
            href={this.state.download.dataUrl}>
            {t('dialogs.save.save-button', 'Save to your computer…')}
          </a>
        </p>
        <footer dangerouslySetInnerHTML={{ __html: t('dialogs.save.license', 'This Streetmix-created image may be reused anywhere, for any purpose, under the<br /><a href="http://creativecommons.org/licenses/by-sa/4.0/">Creative Commons Attribution-ShareAlike 4.0 International License</a>.') }} />
      </Dialog>
    )
  }
}

SaveAsImageDialog.propTypes = {
  transparentSky: PropTypes.bool.isRequired,
  segmentNames: PropTypes.bool.isRequired,
  streetName: PropTypes.bool.isRequired
}

function mapStateToProps (state) {
  return {
    transparentSky: state.settings.saveAsImageTransparentSky,
    segmentNames: state.settings.saveAsImageSegmentNamesAndWidths,
    streetName: state.settings.saveAsImageStreetName
  }
}

export default connect(mapStateToProps)(SaveAsImageDialog)

function makeFilename () {
  let filename = normalizeSlug(getStreet().name)
  if (!filename) {
    filename = 'street'
  }
  filename += '.png'

  return filename
}
