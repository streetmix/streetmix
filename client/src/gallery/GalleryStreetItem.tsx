import React, { useState, useRef, useLayoutEffect } from 'react'
import { useIntl, FormattedMessage } from 'react-intl'

import { useSelector } from '../store/hooks'
import { useGetUserQuery } from '../store/services/api'
import { getStreetUrl } from '../app/page_url'
import DateTimeRelative from '../app/DateTimeRelative'
import StreetName from '../streets/StreetName'
import { drawStreetThumbnail } from '../streets/thumbnail'
import Icon from '../ui/Icon'

import type { Street } from '@streetmix/types'
import './GalleryStreetItem.css'

const THUMBNAIL_WIDTH = 180
const THUMBNAIL_HEIGHT = 110
const THUMBNAIL_MULTIPLIER = 0.1 * 2

interface GalleryStreetItemProps {
  street: Street
  showStreetOwner: boolean
  selected: boolean
  allowDelete: boolean
  doSelect: (id: string) => void
  doDelete: (id: string) => void
}

function GalleryStreetItem (
  props: GalleryStreetItemProps
): React.ReactElement | null {
  const {
    street,
    showStreetOwner = true,
    selected = false,
    allowDelete = false,
    doSelect,
    doDelete
  } = props
  const dpi = useSelector((state) => state.system.devicePixelRatio || 1)
  const { data: creatorProfile } = useGetUserQuery(street.creatorId)
  const [isError, setError] = useState<boolean>(false)
  const thumbnailEl = useRef<HTMLCanvasElement>(null)
  const intl = useIntl()

  // Effect hook draws thumbnail to canvas element after mounting
  useLayoutEffect(() => {
    if (thumbnailEl.current === null) return

    const ctx = thumbnailEl.current.getContext('2d')
    if (ctx === null) return

    try {
      drawStreetThumbnail(ctx, street.data.street, {
        // TODO: document magic number 2
        width: THUMBNAIL_WIDTH * 2,
        height: THUMBNAIL_HEIGHT * 2,
        dpi,
        multiplier: THUMBNAIL_MULTIPLIER,
        silhouette: false,
        transparentSky: false,
        segmentNamesAndWidths: false,
        streetName: false,
        watermark: false
      })
    } catch (error) {
      setError(true)
    }
  }, [thumbnailEl, street, dpi])

  // Define event handlers
  function handleSelectStreet (event: React.MouseEvent): void {
    event.preventDefault()
    if (event.shiftKey || event.ctrlKey || event.metaKey) return
    doSelect(street.id)
  }

  function handleDeleteStreet (event: React.MouseEvent): void {
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
          street.name ??
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
  if (street.data === undefined) {
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
        <div className="gallery-street-item-inner">
          <div className="gallery-street-item-canvas">
            {/* eslint-disable-next-line multiline-ternary -- Formatting conflicts with prettier */}
            {isError ? (
              <div className="gallery-street-item-error">
                <FormattedMessage
                  id="gallery.thumbnail-error"
                  defaultMessage="Thumbnail image is not available."
                />
              </div>
            ) : (
              <canvas
                // TODO: document magic number 2
                width={THUMBNAIL_WIDTH * dpi * 2}
                height={THUMBNAIL_HEIGHT * dpi * 2}
                ref={thumbnailEl}
              />
            )}
          </div>
          <div className="gallery-street-item-label">
            {/* Show street creator (owner) or 'Anonymous' */}
            {showStreetOwner && (
              <div>
                {creatorProfile?.displayName ??
                  street.creatorId ??
                  intl.formatMessage({
                    id: 'users.anonymous',
                    defaultMessage: 'Anonymous'
                  })}
              </div>
            )}
            <div className="gallery-street-item-date">
              <DateTimeRelative value={street.updatedAt} />
            </div>
          </div>
        </div>
        <StreetName name={street.name} />
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
          <Icon name="trash" />
        </button>
      )}
    </div>
  )
}

export default GalleryStreetItem
