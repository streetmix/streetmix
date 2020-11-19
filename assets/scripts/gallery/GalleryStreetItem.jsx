import React, { useState, useRef, useLayoutEffect } from 'react'
import PropTypes from 'prop-types'
import { useSelector } from 'react-redux'
import { useIntl, FormattedMessage } from 'react-intl'
import { getStreetUrl } from '../app/page_url'
import DateTimeRelative from '../app/DateTimeRelative'
import StreetName from '../streets/StreetName'
import { drawStreetThumbnail } from '../streets/thumbnail'
import Icon from '../ui/Icon'

const THUMBNAIL_WIDTH = 180
const THUMBNAIL_HEIGHT = 110
const THUMBNAIL_MULTIPLIER = 0.1 * 2

GalleryStreetItem.propTypes = {
  street: PropTypes.object.isRequired,
  showStreetOwner: PropTypes.bool,
  selected: PropTypes.bool,
  allowDelete: PropTypes.bool,
  doSelect: PropTypes.func,
  doDelete: PropTypes.func
}

function GalleryStreetItem (props) {
  // Destructure and set default props
  const {
    street,
    showStreetOwner = true,
    selected = false,
    allowDelete = false,
    doSelect = () => {}, // no-op
    doDelete = () => {} // no-op
  } = props
  const dpi = useSelector((state) => state.system.devicePixelRatio || 1)

  // Set hooks
  const [error, setError] = useState(null)
  const thumbnailEl = useRef(null)
  const intl = useIntl()

  // Effect hook draws thumbnail to canvas element after mounting
  useLayoutEffect(() => {
    if (!street.data) return

    const ctx = thumbnailEl.current.getContext('2d')

    try {
      // TODO: document magic number 2
      drawStreetThumbnail(
        ctx,
        street.data.street,
        THUMBNAIL_WIDTH * 2,
        THUMBNAIL_HEIGHT * 2,
        dpi,
        THUMBNAIL_MULTIPLIER,
        true,
        false,
        true,
        false,
        false,
        false
      )
    } catch (error) {
      if (error) {
        setError(error)
      }
    }
  }, [thumbnailEl, street, dpi])

  // Define event handlers
  function handleSelectStreet (event) {
    event.preventDefault()
    if (event.shiftKey || event.ctrlKey || event.metaKey) return
    doSelect(street.id)
  }

  function handleDeleteStreet (event) {
    event.preventDefault()
    event.stopPropagation()

    const message = intl.formatMessage(
      {
        id: 'prompt.delete-street',
        defaultMessage:
          'Are you sure you want to permanently delete {streetName}? This cannot be undone.'
      },
      {
        streetName:
          street.name ||
          intl.formatMessage({
            id: 'street.default-name',
            defaultMessage: 'Unnamed St'
          })
      }
    )

    if (window.confirm(message)) {
      doDelete(street.id)
    }
  }

  // Bail if there is no street data
  // TODO: handle data errors better
  if (!street.data) {
    console.error('No street data!', street)
    return null
  }

  const classNames = ['gallery-street-item']
  if (selected) {
    classNames.push('gallery-selected')
  }

  return (
    <div className={classNames.join(' ')}>
      <a href={getStreetUrl(street)} onClick={handleSelectStreet}>
        {error ? (
          <div className="gallery-street-item-error">
            <FormattedMessage
              id="gallery.thumbnail-error"
              defaultMessage="Thumbnail image is not available."
            />
          </div>
        ) : (
          /* TODO: document magic number 2 */
          <canvas
            width={THUMBNAIL_WIDTH * dpi * 2}
            height={THUMBNAIL_HEIGHT * dpi * 2}
            ref={thumbnailEl}
          />
        )}

        <StreetName name={street.name} />

        <span className="gallery-street-item-date">
          <DateTimeRelative value={street.updatedAt} />
        </span>

        {/* Show street creator (owner) or 'Anonymous' */}
        {showStreetOwner && (
          <span className="gallery-street-item-creator">
            {street.creatorId ||
              intl.formatMessage({
                id: 'users.anonymous',
                defaultMessage: 'Anonymous'
              })}
          </span>
        )}
      </a>

      {/* Only show delete button if allowed, e.g. if user is owner of the street */}
      {allowDelete && (
        <button
          className="gallery-street-item-delete"
          onClick={handleDeleteStreet}
          title={intl.formatMessage({
            id: 'gallery.delete-street-tooltip',
            defaultMessage: 'Delete street'
          })}
        >
          <Icon icon="trash" />
        </button>
      )}
    </div>
  )
}

export default GalleryStreetItem
