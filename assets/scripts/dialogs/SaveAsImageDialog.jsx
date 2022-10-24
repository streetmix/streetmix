/**
 * Save as Image (dialog box)
 *
 * Handles interaction on the "Save as image" dialog box.
 *
 */
import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { FormattedMessage, injectIntl } from 'react-intl'
import { saveAs } from 'file-saver'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICON_LOCK } from '../ui/icons'
import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import Tooltip from '../ui/Tooltip'
import Terms from '../app/Terms'
import { getStreetImage } from '../streets/image'
import { updateSettings } from '../store/slices/settings'
import { normalizeSlug } from '../util/helpers'
import CustomScale from './SaveAsImage/CustomScale'
import Dialog from './Dialog'
import './SaveAsImageDialog.scss'

const DEFAULT_IMAGE_DPI = 2

class SaveAsImageDialog extends React.Component {
  static propTypes = {
    intl: PropTypes.object.isRequired,
    locale: PropTypes.string,
    transparentSky: PropTypes.bool.isRequired,
    segmentNames: PropTypes.bool.isRequired,
    streetName: PropTypes.bool.isRequired,
    watermark: PropTypes.bool.isRequired,
    street: PropTypes.object.isRequired,
    name: PropTypes.string,
    isSubscriber: PropTypes.bool,
    updateSettings: PropTypes.func
  }

  constructor (props) {
    super(props)

    this.state = {
      scale: 1,
      isLoading: false,
      isShowingPreview: false,
      isSaving: false,
      errorMessage: null,
      download: {
        filename: '',
        dataUrl: ''
      },
      baseWidth: 0,
      baseHeight: 0
    }
  }

  componentDidMount () {
    this.updatePreview()
  }

  componentDidUpdate (prevProps, prevState) {
    if (this.state.isLoading === true) {
      // Update preview when props change; make a slight delay because there is
      // a slight lag on image creation, but it's so short it feels weird.
      // Time delay makes the "Loading" feel "right."
      window.setTimeout(() => {
        this.updatePreview()
      }, 100)
    }
  }

  // When options change, this changes props.
  handleChangeOptionTransparentSky = (event) => {
    this.props.updateSettings({
      saveAsImageTransparentSky: event.target.checked
    })
    this.setState({ isLoading: true })
  }

  handleChangeOptionSegmentNames = (event) => {
    this.props.updateSettings({
      saveAsImageSegmentNamesAndWidths: event.target.checked
    })
    this.setState({ isLoading: true })
  }

  handleChangeOptionStreetName = (event) => {
    this.props.updateSettings({ saveAsImageStreetName: event.target.checked })
    this.setState({ isLoading: true })
  }

  handleChangeOptionWatermark = (event) => {
    this.props.updateSettings({ saveAsImageWatermark: event.target.checked })
    this.setState({ isLoading: true })
  }

  handleChangeScale = (value) => {
    this.setState({
      errorMessage2: false, // Clears "too big" error if present
      scale: value
    })
  }

  handlePreviewLoaded = () => {
    this.setState({ isLoading: false })
  }

  handlePreviewError = () => {
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
  handleClickDownloadImage = (event) => {
    event.preventDefault()
    this.setState({
      isSaving: true
    })

    try {
      // Update the image with the actual size before saving.
      // Images that are too large can throw an error, so catch it
      // and show an error
      this.updatePreviewImage(this.state.scale)
    } catch (err) {
      this.setState({
        isSaving: false,
        errorMessage2: true
      })
      return
    }

    this.imageCanvas.toBlob((blob) => {
      const filename = this.makeFilename()
      saveAs(blob, filename)
      window.setTimeout(() => {
        this.setState({
          isSaving: false
        })
      }, 0)
    })
  }

  updatePreviewImage = (scale = 1) => {
    // The preview is rendered at the default scale at first.
    this.imageCanvas = getStreetImage(
      this.props.street,
      this.props.transparentSky,
      this.props.segmentNames,
      this.props.streetName,
      DEFAULT_IMAGE_DPI * scale,
      this.props.watermark
    )
  }

  updatePreview = () => {
    this.updatePreviewImage(1)
    this.setState({
      baseWidth: this.imageCanvas?.width,
      baseHeight: this.imageCanvas?.height
    })

    // .toDataURL is not available on IE11 when SVGs are part of the canvas.
    // The error in catch() should not appear on any of the newer evergreen browsers.
    try {
      const dataUrl = this.imageCanvas.toDataURL('image/png')
      this.setState({
        download: {
          filename: this.makeFilename(),
          dataUrl
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

  render () {
    return (
      <Dialog>
        {() => (
          <div className="save-as-image-dialog">
            <header>
              <h1>
                <FormattedMessage
                  id="dialogs.save.heading"
                  defaultMessage="Save as image"
                />
              </h1>
            </header>
            <div className="dialog-content">
              <div className="save-as-image-options">
                <Checkbox
                  onChange={this.handleChangeOptionSegmentNames}
                  checked={this.props.segmentNames}
                >
                  <FormattedMessage
                    id="dialogs.save.option-labels"
                    defaultMessage="Segment names and widths"
                  />
                </Checkbox>

                <Checkbox
                  onChange={this.handleChangeOptionStreetName}
                  checked={this.props.streetName}
                >
                  <FormattedMessage
                    id="dialogs.save.option-name"
                    defaultMessage="Street name"
                  />
                </Checkbox>

                <Checkbox
                  onChange={this.handleChangeOptionTransparentSky}
                  checked={this.props.transparentSky}
                >
                  <FormattedMessage
                    id="dialogs.save.option-sky"
                    defaultMessage="Transparent sky"
                  />
                </Checkbox>

                {/* eslint-disable-next-line multiline-ternary -- Formatting conflicts with prettier */}
                {this.props.isSubscriber ? (
                  <Checkbox
                    onChange={this.handleChangeOptionWatermark}
                    checked={this.props.watermark}
                  >
                    <FormattedMessage
                      id="dialogs.save.option-watermark"
                      defaultMessage="Watermark"
                    />
                  </Checkbox>
                ) : (
                  <Tooltip
                    label={this.props.intl.formatMessage({
                      id: 'plus.locked.sub',
                      // Default message ends with a Unicode-only left-right order mark
                      // to allow for proper punctuation in `rtl` text direction
                      // This character is hidden from editors by default!
                      defaultMessage: 'Upgrade to Streetmix+ to use!‎'
                    })}
                  >
                    {/* div shim for Tooltip child element */}
                    <div className="checkbox-item">
                      <Checkbox
                        onChange={this.handleChangeOptionWatermark}
                        checked={this.props.watermark}
                        disabled={!this.props.isSubscriber}
                      >
                        <FormattedMessage
                          id="dialogs.save.option-watermark"
                          defaultMessage="Watermark"
                        />
                        &nbsp;
                        <FontAwesomeIcon icon={ICON_LOCK} />
                      </Checkbox>
                    </div>
                  </Tooltip>
                )}
              </div>
              <div className="save-as-image-preview">
                {!this.state.errorMessage && (
                  <div className="save-as-image-preview-image">
                    <div
                      className="save-as-image-preview-loading"
                      style={{ display: !this.state.isLoading && 'none' }}
                    >
                      <FormattedMessage
                        id="dialogs.save.loading"
                        defaultMessage="Loading…"
                      />
                    </div>
                    <img
                      src={this.state.download.dataUrl}
                      onLoad={this.handlePreviewLoaded}
                      onError={this.handlePreviewError}
                      alt={this.props.intl.formatMessage({
                        id: 'dialogs.save.preview-image-alt',
                        defaultMessage: 'Preview'
                      })}
                    />
                  </div>
                )}
                {this.state.errorMessage && (
                  <div className="save-as-image-preview-error">
                    {this.state.errorMessage}
                  </div>
                )}
              </div>
              <CustomScale
                scale={this.state.scale}
                width={this.state.baseWidth}
                height={this.state.baseHeight}
                onChange={this.handleChangeScale}
              />
              <div className="save-as-image-download">
                {this.state.errorMessage2 && (
                  <span className="save-as-image-too-large-error">
                    <FormattedMessage
                      id="dialogs.save.error-too-large"
                      defaultMessage="This image is too big and we were not able to create it. Please try a smaller custom size."
                    />
                  </span>
                )}
                {/* eslint-disable-next-line multiline-ternary -- Formatting conflicts with prettier */}
                {!this.state.errorMessage && !this.state.isSaving ? (
                  <Button
                    primary={true}
                    onClick={this.handleClickDownloadImage}
                  >
                    <FormattedMessage
                      id="dialogs.save.save-button"
                      defaultMessage="Save to your computer…"
                    />
                  </Button>
                ) : (
                  // TODO: When saving, show busy cursor and "Please wait"
                  <Button primary={true} disabled={true}>
                    <FormattedMessage
                      id="dialogs.save.save-button"
                      defaultMessage="Save to your computer…"
                    />
                  </Button>
                )}
              </div>
            </div>
            <footer>
              <Terms locale={this.props.locale} />
            </footer>
          </div>
        )}
      </Dialog>
    )
  }
}

function mapStateToProps (state) {
  return {
    locale: state.locale.locale,
    transparentSky: state.settings.saveAsImageTransparentSky,
    segmentNames: state.settings.saveAsImageSegmentNamesAndWidths,
    streetName: state.settings.saveAsImageStreetName,
    // Even if watermarks are off, override if user isn't subscribed
    watermark: state.settings.saveAsImageWatermark || !state.user.isSubscriber,
    street: state.street,
    name: state.street.name,
    isSubscriber: state.user.isSubscriber
  }
}

const mapDispatchToProps = {
  updateSettings
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(injectIntl(SaveAsImageDialog))
