/**
 * Save as Image (dialog box)
 *
 * Handles interaction on the "Save as image" dialog box.
 *
 */
import React, { useState, useEffect, useRef } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { FormattedMessage, useIntl } from 'react-intl'
import { saveAs } from 'file-saver'

import Button from '../ui/Button'
import Checkbox from '../ui/Checkbox'
import Icon from '../ui/Icon'
import Tooltip from '../ui/Tooltip'
import Terms from '../app/Terms'
import { getStreetImage } from '../streets/image'
import { updateSettings } from '../store/slices/settings'
import { normalizeSlug } from '../util/helpers'
import CustomScale from './SaveAsImage/CustomScale'
import Dialog from './Dialog'
import './SaveAsImageDialog.scss'

const DEFAULT_IMAGE_DPI = 2

function SaveAsImageDialog (props) {
  const imageCanvas = useRef()
  const [scale, setScale] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState(null)
  const [errorMessage2, setErrorMessage2] = useState(null)
  const [downloadDataUrl, setDownloadDataUrl] = useState('')
  const [baseDimensions, setBaseDimensions] = useState({})
  const locale = useSelector((state) => state.locale.locale)
  const transparentSky = useSelector(
    (state) => state.settings.saveAsImageTransparentSky
  )
  const segmentNames = useSelector(
    (state) => state.settings.saveAsImageSegmentNamesAndWidths
  )
  const streetName = useSelector(
    (state) => state.settings.saveAsImageStreetName
  )
  // even if watermarks are off, override if user isn't subscribed
  const watermark = useSelector(
    (state) => state.settings.saveAsImageWatermark || !state.user.isSubscriber
  )
  const street = useSelector((state) => state.street)
  const name = useSelector((state) => state.street.name)
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const intl = useIntl()
  const dispatch = useDispatch()

  useEffect(() => {
    updatePreview()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setIsLoading(true)
    // Update preview when props change; make a slight delay because there is
    // a slight lag on image creation, but it's so short it feels weird.
    // Time delay makes the "Loading" feel "right."
    window.setTimeout(() => {
      updatePreview()
    }, 100)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transparentSky, segmentNames, streetName, watermark])

  function makeFilename () {
    let filename = normalizeSlug(name)
    if (!filename) {
      filename = 'street'
    }
    filename += '.png'

    return filename
  }

  // When options change, this changes props.
  const handleChangeOptionTransparentSky = (event) => {
    dispatch(
      updateSettings({
        saveAsImageTransparentSky: event.target.checked
      })
    )
  }

  const handleChangeOptionSegmentNames = (event) => {
    dispatch(
      updateSettings({
        saveAsImageSegmentNamesAndWidths: event.target.checked
      })
    )
  }

  const handleChangeOptionStreetName = (event) => {
    dispatch(updateSettings({ saveAsImageStreetName: event.target.checked }))
  }

  const handleChangeOptionWatermark = (event) => {
    dispatch(updateSettings({ saveAsImageWatermark: event.target.checked }))
  }

  const handleChangeScale = (value) => {
    setErrorMessage2(false) // Clears "too big" error if present
    setScale(value)
  }

  const handlePreviewLoaded = () => {
    setIsLoading(false)
  }

  const handlePreviewError = () => {
    setIsLoading(false)
    setErrorMessage(
      intl.formatMessage({
        id: 'dialogs.save.error-preview',
        defaultMessage: 'There was an error displaying a preview image.'
      })
    )
  }

  /**
   * When download links are clicked, convert the dataURL to a blob for download.
   * Designed to get around a limitation in IE where a dataURL is not downloadable
   * directly (https://msdn.microsoft.com/en-us/library/cc848897(v=vs.85).aspx)
   */
  const handleClickDownloadImage = (event) => {
    event.preventDefault()
    setIsSaving(true)

    try {
      // Update the image with the actual size before saving.
      // Images that are too large can throw an error, so catch it
      // and show an error
      updatePreviewImage(scale)
    } catch (err) {
      setIsSaving(false)
      setErrorMessage2(true)
      return
    }

    imageCanvas.current.toBlob((blob) => {
      const filename = makeFilename()
      saveAs(blob, filename)
      window.setTimeout(() => {
        setIsSaving(false)
      }, 0)
    })
  }

  const updatePreviewImage = (scale = 1) => {
    // The preview is rendered at the default scale at first.
    imageCanvas.current = getStreetImage(
      street,
      transparentSky,
      segmentNames,
      streetName,
      DEFAULT_IMAGE_DPI * scale,
      watermark
    )
  }

  const updatePreview = () => {
    updatePreviewImage(1)
    // Only set base dimensions when preview is generated at scale = 1.
    // The custom slider will update target dimensions by multiplying base * scale
    // which is faster than rendering the entire image and reading its dimensions.
    setBaseDimensions({
      width: imageCanvas.current?.width,
      height: imageCanvas.current?.height
    })

    // .toDataURL is not available on IE11 when SVGs are part of the canvas.
    // The error in catch() should not appear on any of the newer evergreen browsers.
    try {
      const dataUrl = imageCanvas.current.toDataURL('image/png')
      setDownloadDataUrl(dataUrl)
      setErrorMessage(null)
    } catch (e) {
      setErrorMessage(
        intl.formatMessage({
          id: 'dialogs.save.error-unavailable',
          defaultMessage: 'Saving to image is not available on this browser.'
        })
      )
    }
  }

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
                onChange={handleChangeOptionSegmentNames}
                checked={segmentNames}
              >
                <FormattedMessage
                  id="dialogs.save.option-labels"
                  defaultMessage="Segment names and widths"
                />
              </Checkbox>

              <Checkbox
                onChange={handleChangeOptionStreetName}
                checked={streetName}
              >
                <FormattedMessage
                  id="dialogs.save.option-name"
                  defaultMessage="Street name"
                />
              </Checkbox>

              <Checkbox
                onChange={handleChangeOptionTransparentSky}
                checked={transparentSky}
              >
                <FormattedMessage
                  id="dialogs.save.option-sky"
                  defaultMessage="Transparent sky"
                />
              </Checkbox>

              {/* eslint-disable-next-line multiline-ternary -- Formatting conflicts with prettier */}
              {isSubscriber ? (
                <Checkbox
                  onChange={handleChangeOptionWatermark}
                  checked={watermark}
                >
                  <FormattedMessage
                    id="dialogs.save.option-watermark"
                    defaultMessage="Watermark"
                  />
                </Checkbox>
              ) : (
                <Tooltip
                  label={intl.formatMessage({
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
                      onChange={handleChangeOptionWatermark}
                      checked={watermark}
                      disabled={!isSubscriber}
                    >
                      <FormattedMessage
                        id="dialogs.save.option-watermark"
                        defaultMessage="Watermark"
                      />
                      &nbsp;
                      <Icon name="lock" />
                    </Checkbox>
                  </div>
                </Tooltip>
              )}
            </div>
            <div className="save-as-image-preview">
              {!errorMessage && (
                <div className="save-as-image-preview-image">
                  <div
                    className="save-as-image-preview-loading"
                    style={{ display: !isLoading && 'none' }}
                  >
                    <FormattedMessage
                      id="dialogs.save.loading"
                      defaultMessage="Loading…"
                    />
                  </div>
                  <img
                    src={downloadDataUrl}
                    onLoad={handlePreviewLoaded}
                    onError={handlePreviewError}
                    alt={intl.formatMessage({
                      id: 'dialogs.save.preview-image-alt',
                      defaultMessage: 'Preview'
                    })}
                  />
                </div>
              )}
              {errorMessage && (
                <div className="save-as-image-preview-error">
                  {errorMessage}
                </div>
              )}
            </div>
            <CustomScale
              scale={scale}
              baseDimensions={baseDimensions}
              onChange={handleChangeScale}
            />
            <div className="save-as-image-download">
              {errorMessage2 && (
                <span className="save-as-image-too-large-error">
                  <FormattedMessage
                    id="dialogs.save.error-too-large"
                    defaultMessage="This image is too big and we were not able to create it. Please try a smaller custom size."
                  />
                </span>
              )}
              {/* eslint-disable-next-line multiline-ternary -- Formatting conflicts with prettier */}
              {!errorMessage && !isSaving ? (
                <Button primary={true} onClick={handleClickDownloadImage}>
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
            <Terms locale={locale} />
          </footer>
        </div>
      )}
    </Dialog>
  )
}

export default SaveAsImageDialog
