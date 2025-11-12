import React, { useState, useEffect, useRef } from 'react'
import { FormattedMessage, useIntl } from 'react-intl'
import { saveAs } from 'file-saver'

import { useSelector, useDispatch } from '~/src/store/hooks'
import { updateSettings } from '~/src/store/slices/settings'
import Button from '~/src/ui/Button'
import Checkbox from '~/src/ui/Checkbox'
import Icon from '~/src/ui/Icon'
import { Tooltip } from '~/src/ui/Tooltip'
import Terms from '~/src/app/Terms'
import { getStreetImage } from '~/src/streets/image'
import { normalizeSlug } from '~/src/util/helpers'
import Dialog from '../Dialog'
import CustomScale from './CustomScale'
import './SaveAsImageDialog.css'

const DEFAULT_IMAGE_DPI = 2

function SaveAsImageDialog (): React.ReactElement {
  const imageCanvas = useRef<HTMLCanvasElement | null>(null)
  const [scale, setScale] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [errorMessage2, setErrorMessage2] = useState<boolean>(false)
  const [downloadDataUrl, setDownloadDataUrl] = useState<string | null>(null)
  const [baseDimensions, setBaseDimensions] = useState({})
  const locale = useSelector((state) => state.locale.locale)
  const {
    saveAsImageTransparentSky: transparentSky,
    saveAsImageSegmentNamesAndWidths: segmentNames,
    saveAsImageStreetName: streetName
  } = useSelector((state) => state.settings)
  // even if watermarks are off, override if user isn't subscribed
  const watermark = useSelector(
    (state) => state.settings.saveAsImageWatermark || !state.user.isSubscriber
  )
  const street = useSelector((state) => state.street)
  const isSubscriber = useSelector((state) => state.user.isSubscriber)
  const intl = useIntl()
  const dispatch = useDispatch()

  // New export pipeline for testing
  const newExport = useSelector(
    (state) => state.flags.SAVE_AS_IMAGE_NEW_EXPORT_PIPELINE.value
  )
  const [isNewExport, setNewExport] = useState(newExport)

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
  }, [transparentSky, segmentNames, streetName, watermark, isNewExport])

  // Same as above but ONLY update preview if it we're using the new export
  // pipeline, and the scale changes
  useEffect(() => {
    if (isNewExport) {
      setIsLoading(true)
      window.setTimeout(() => {
        updatePreview()
      }, 100)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scale, isNewExport])

  function makeFilename (): string {
    let filename = normalizeSlug(street.name)
    if (filename === undefined) {
      filename = 'street'
    }
    filename += '.png'

    return filename
  }

  // When options change, this changes props.
  const toggleTransparentSky = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    dispatch(
      updateSettings({
        saveAsImageTransparentSky: event.target.checked
      })
    )
  }

  const toggleSegmentNames = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    dispatch(
      updateSettings({
        saveAsImageSegmentNamesAndWidths: event.target.checked
      })
    )
  }

  const toggleStreetName = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    dispatch(updateSettings({ saveAsImageStreetName: event.target.checked }))
  }

  const toggleWatermark = (
    event: React.ChangeEvent<HTMLInputElement>
  ): void => {
    dispatch(updateSettings({ saveAsImageWatermark: event.target.checked }))
  }

  const toggleNewExport = (): void => {
    setNewExport(!isNewExport)
  }

  const handleChangeScale = (value: number): void => {
    setErrorMessage2(false) // Clears "too big" error if present
    setScale(value)
  }

  const handlePreviewLoaded = (): void => {
    setIsLoading(false)
  }

  const handlePreviewError = (): void => {
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
  const handleClickDownloadImage = (event: React.MouseEvent): void => {
    event.preventDefault()
    setIsSaving(true)

    if (isNewExport) {
      const filename = makeFilename()
      saveAs(
        `/api/v1/streets/${street.id}/image?transparentSky=${transparentSky}&labels=${segmentNames}&streetName=${streetName}&watermark=${watermark}&locale=${locale}&scale=${scale}&experimental=1`,
        filename
      )
      window.setTimeout(() => {
        setIsSaving(false)
      }, 0)
      return
    }

    try {
      // Update the image with the actual size before saving.
      // Images that are too large can throw an error, so catch it
      // and show an error
      updatePreviewImage(scale)

      imageCanvas.current?.toBlob((blob) => {
        // Also throw an error if blob is null, which is a possible input
        // value of toBlob() according to typescript
        if (blob === null) throw new Error()

        // Save that file
        const filename = makeFilename()
        saveAs(blob, filename)
        window.setTimeout(() => {
          setIsSaving(false)
        }, 0)
      })
    } catch (err) {
      setIsSaving(false)
      setErrorMessage2(true)
    }
  }

  const updatePreviewImage = (scale = 1): void => {
    // The preview is rendered at the default scale at first.
    imageCanvas.current = getStreetImage(
      street,
      transparentSky,
      segmentNames,
      streetName,
      DEFAULT_IMAGE_DPI * scale,
      watermark,
      locale
    )
  }

  const updatePreview = (): void => {
    // If we're previewing using the new export image pipeline, set url
    // to the API export directly, then skip the rest of the function
    if (isNewExport) {
      setDownloadDataUrl(
        `/api/v1/streets/${street.id}/image?transparentSky=${transparentSky}&labels=${segmentNames}&streetName=${streetName}&watermark=${watermark}&locale=${locale}&scale=${scale}&experimental=1`
      )
      return
    }

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
      const dataUrl = imageCanvas.current?.toDataURL('image/png')
      if (dataUrl === undefined) throw new Error()
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
              {newExport && (
                <p style={{ marginTop: 0, marginBottom: '0.25em' }}>
                  <Checkbox onChange={toggleNewExport} checked={isNewExport}>
                    New export pipeline (WIP)
                  </Checkbox>
                </p>
              )}
              <Checkbox onChange={toggleSegmentNames} checked={segmentNames}>
                <FormattedMessage
                  id="dialogs.save.option-labels"
                  defaultMessage="Segment names and widths"
                />
              </Checkbox>

              <Checkbox onChange={toggleStreetName} checked={streetName}>
                <FormattedMessage
                  id="dialogs.save.option-name"
                  defaultMessage="Street name"
                />
              </Checkbox>

              <Checkbox
                onChange={toggleTransparentSky}
                checked={transparentSky}
              >
                <FormattedMessage
                  id="dialogs.save.option-sky"
                  defaultMessage="Transparent sky"
                />
              </Checkbox>

              {/* eslint-disable-next-line multiline-ternary -- Formatting conflicts with prettier */}
              {isSubscriber ? (
                <Checkbox onChange={toggleWatermark} checked={watermark}>
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
                  <Checkbox
                    onChange={toggleWatermark}
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
                </Tooltip>
              )}
            </div>
            <div className="save-as-image-preview">
              {errorMessage === null && (
                <div className="save-as-image-preview-image">
                  <div
                    className="save-as-image-preview-loading"
                    style={{ display: isLoading ? 'flex' : 'none' }}
                  >
                    <FormattedMessage
                      id="dialogs.save.loading"
                      defaultMessage="Loading…"
                    />
                  </div>
                  {/* Initial value of `downloadDataUrl` is null, rather than an
                      empty string. We get a warning that this could cause a
                      browser to re-download the page if `src` is set to an
                      empty string. */}
                  {downloadDataUrl !== null && (
                    <img
                      src={downloadDataUrl}
                      onLoad={handlePreviewLoaded}
                      onError={handlePreviewError}
                      alt={intl.formatMessage({
                        id: 'dialogs.save.preview-image-alt',
                        defaultMessage: 'Preview'
                      })}
                    />
                  )}
                </div>
              )}
              {errorMessage !== null && (
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
              {errorMessage === null && !isSaving ? (
                <Button primary onClick={handleClickDownloadImage}>
                  <FormattedMessage
                    id="dialogs.save.save-button"
                    defaultMessage="Save to your computer…"
                  />
                </Button>
              ) : (
                // TODO: When saving, show busy cursor and "Please wait"
                <Button primary disabled>
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
