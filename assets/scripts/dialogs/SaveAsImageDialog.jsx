/**
 * Save as Image (dialog box)
 *
 * Handles interaction on the "Save as image" dialog box.
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage, FormattedHTMLMessage, injectIntl, intlShape } from 'react-intl'
import { trackEvent } from '../app/event_tracking'
import { getStreetImage } from '../streets/image'
import { setSettings } from '../store/actions/settings'
import { normalizeSlug } from '../util/helpers'

// Require save-as polyfills
import { saveAs } from 'file-saver'

export class SaveAsImageDialog extends React.Component {
  static propTypes = {
    intl: intlShape,
    locale: PropTypes.string,
    transparentSky: PropTypes.bool.isRequired,
    segmentNames: PropTypes.bool.isRequired,
    streetName: PropTypes.bool.isRequired,
    street: PropTypes.object.isRequired,
    name: PropTypes.string,
    setSettings: PropTypes.func
  }

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
  }

  static getDerivedStateFromProps (nextProps, prevState) {
    if (prevState.isLoading === false) {
      return { isLoading: true }
    }

    return null
  }

  componentDidMount () {
    trackEvent('Sharing', 'Save as image', null, null, false)

    this.updatePreview()
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.isLoading === true) {
      // Update preview when props change; make a slight delay because there is
      // a slight lag on image creation, but it's so short it feels weird.
      // Time delay makes the "Loading" feel "right."
      window.setTimeout(() => {
        this.updatePreview()
      }, 50)
    }
  }

  // When options change, this changes props.
  onChangeOptionTransparentSky = (event) => {
    this.props.setSettings({ saveAsImageTransparentSky: event.target.checked })
  }

  onChangeOptionSegmentNames = (event) => {
    this.props.setSettings({ saveAsImageSegmentNamesAndWidths: event.target.checked })
  }

  onChangeOptionStreetName = (event) => {
    this.props.setSettings({ saveAsImageStreetName: event.target.checked })
  }

  onPreviewLoaded = () => {
    this.setState({ isLoading: false })
  }

  onPreviewError = () => {
    this.setState({
      isLoading: false,
      errorMessage: this.props.intl.formatMessage({
        id: 'dialogs.save.error-preview',
        defaultMessage: 'There was an error displaying a preview image.'
      })
    })
  }

  /**
   * When download links are clicked, convert the dataURL to a blob for download.
   * Designed to get around a limitation in IE where a dataURL is not downloadable
   * directly (https://msdn.microsoft.com/en-us/library/cc848897(v=vs.85).aspx)
   */
  onClickDownloadImage = (event) => {
    event.preventDefault()
    this.imageCanvas.toBlob((blob) => {
      const filename = this.makeFilename()
      saveAs(blob, filename)
    })
  }

  updatePreview = () => {
    this.imageCanvas = getStreetImage(this.props.street, this.props.transparentSky, this.props.segmentNames, this.props.streetName)

    // .toDataURL is not available on IE11 when SVGs are part of the canvas.
    // The error in catch() should not appear on any of the newer evergreen browsers.
    try {
      const dataUrl = this.imageCanvas.toDataURL('image/png')
      this.setState({
        download: {
          filename: this.makeFilename(),
          dataUrl: dataUrl
        },
        errorMessage: null
      })
    } catch (e) {
      this.setState({
        errorMessage: this.props.intl.formatMessage({
          id: 'dialogs.save.error-unavailable',
          defaultMessage: 'Saving to image is not available on this browser.'
        })
      })
    }
  }

  makeFilename = () => {
    let filename = normalizeSlug(this.props.name)
    if (!filename) {
      filename = 'street'
    }
    filename += '.png'

    return filename
  }

  getCCLinkByLocale = () => {
    let url

    switch (this.props.locale) {
      case 'ar':
        url = 'https://creativecommons.org/licenses/by-sa/4.0/deed.ar'
        break
      case 'de':
        url = 'https://creativecommons.org/licenses/by-sa/4.0/deed.de'
        break
      case 'es':
      case 'es-MX':
        url = 'https://creativecommons.org/licenses/by-sa/4.0/deed.es'
        break
      case 'fi':
        url = 'https://creativecommons.org/licenses/by-sa/4.0/deed.fi'
        break
      case 'fr':
        url = 'https://creativecommons.org/licenses/by-sa/4.0/deed.fr'
        break
      case 'ja':
        url = 'https://creativecommons.org/licenses/by-sa/4.0/deed.ja'
        break
      case 'pl':
        url = 'https://creativecommons.org/licenses/by-sa/4.0/deed.pl'
        break
      case 'pt':
        url = 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt'
        break
      case 'pt-BR':
        url = 'https://creativecommons.org/licenses/by-sa/4.0/deed.pt_BR'
        break
      case 'sv':
        url = 'https://creativecommons.org/licenses/by-sa/4.0/deed.sv'
        break
      case 'zh-Hant':
      case 'zh-TW':
        url = 'https://creativecommons.org/licenses/by-sa/4.0/deed.zh_TW'
        break
      case 'en':
      default:
        url = 'https://creativecommons.org/licenses/by-sa/4.0/'
        break
    }

    return url
  }

  render () {
    return (
      <div className="save-as-image-dialog">
        <h1><FormattedMessage id="dialogs.save.heading" defaultMessage="Save as image" /></h1>
        <p>
          <input
            type="checkbox"
            onChange={this.onChangeOptionSegmentNames}
            checked={this.props.segmentNames}
            id="save-as-image-segment-names"
          />
          <label htmlFor="save-as-image-segment-names">
            <FormattedMessage id="dialogs.save.option-labels" defaultMessage="Segment names and widths" />
          </label>

          <input
            type="checkbox"
            onChange={this.onChangeOptionStreetName}
            checked={this.props.streetName}
            id="save-as-image-street-name"
          />
          <label htmlFor="save-as-image-street-name">
            <FormattedMessage id="dialogs.save.option-name" defaultMessage="Street name" />
          </label>

          <input
            type="checkbox"
            onChange={this.onChangeOptionTransparentSky}
            checked={this.props.transparentSky}
            id="save-as-image-transparent-sky"
          />
          <label htmlFor="save-as-image-transparent-sky">
            <FormattedMessage id="dialogs.save.option-sky" defaultMessage="Transparent sky" />
          </label>
        </p>
        {(() => {
          if (this.state.errorMessage) {
            return (
              <div className="save-as-image-preview">
                <div className="save-as-image-preview-loading">
                  {this.state.errorMessage}
                </div>
              </div>
            )
          } else {
            return (
              <div className="save-as-image-preview">
                <div className="save-as-image-preview-loading" style={{display: this.state.isLoading ? 'block' : 'none'}}>
                  <FormattedMessage id="dialogs.save.loading" defaultMessage="Loading…" />
                </div>
                <div className="save-as-image-preview-image" style={{display: this.state.isLoading ? 'none' : 'block'}}>
                  <img
                    src={this.state.download.dataUrl}
                    onLoad={this.onPreviewLoaded}
                    onError={this.onPreviewError}
                    alt={this.props.intl.formatMessage({
                      id: 'dialogs.save.preview-image-alt',
                      defaultMessage: 'Preview'
                    })}
                  />
                </div>
              </div>
            )
          }
        })()}
        <p>
          <a
            className="button-like"
            onClick={this.onClickDownloadImage}
            // Sets the anchor's `download` attribute so that it saves a meaningful filename
            // Note that this property is not supported in Safari/iOS
            download={this.state.download.filename}
            // Link should refer to data URL, even though onClickDownloadImage() is used for direct download
            href={this.state.download.dataUrl}
          >
            <FormattedMessage id="dialogs.save.save-button" defaultMessage="Save to your computer…" />
          </a>
        </p>
        <footer>
          <FormattedHTMLMessage
            id="dialogs.save.license"
            defaultMessage="This Streetmix-created image may be reused anywhere, for any purpose, under the<br /><a href='{url}'>Creative Commons Attribution-ShareAlike 4.0 International License</a>."
            values={{
              // Get locale-specific license links!
              url: this.getCCLinkByLocale()
            }}
          />
        </footer>
      </div>
    )
  }
}

function mapStateToProps (state) {
  return {
    locale: state.locale.locale,
    transparentSky: state.settings.saveAsImageTransparentSky,
    segmentNames: state.settings.saveAsImageSegmentNamesAndWidths,
    streetName: state.settings.saveAsImageStreetName,
    street: state.street,
    name: state.street.name
  }
}

function mapDispatchToProps (dispatch) {
  return {
    setSettings: (settings) => { dispatch(setSettings(settings)) }
  }
}

export default injectIntl(connect(mapStateToProps, mapDispatchToProps)(SaveAsImageDialog))
