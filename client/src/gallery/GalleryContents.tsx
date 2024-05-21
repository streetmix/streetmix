import React, { useRef, useState, useLayoutEffect } from 'react'
import { FormattedMessage } from 'react-intl'
import { useSelector, useDispatch } from '../store/hooks'
import { deleteGalleryStreet } from '../store/slices/gallery'
import Button from '../ui/Button'
import Scrollable from '../ui/Scrollable'
import Avatar from '../users/Avatar'
import { sendDeleteStreetToServer } from '../streets/xhr'
import { showError, ERRORS } from '../app/errors'
import { URL_NEW_STREET, URL_NEW_STREET_COPY_LAST } from '../app/constants'
import GalleryStreetItem from './GalleryStreetItem'
import { switchGalleryStreet } from './index'
import type { UserProfile } from '../types'
import './GalleryContents.scss'

interface GalleryContentsProps {
  user?: UserProfile
}

function GalleryContents ({ user }: GalleryContentsProps): React.ReactElement {
  const streets = useSelector((state) => state.gallery.streets ?? [])
  const currentStreetId = useSelector((state) => state.street.id ?? null)
  const isOwnedByCurrentUser = useSelector(
    (state) =>
      state.user.signedIn &&
      state.gallery.userId === state.user.signInData?.userId
  )
  const dispatch = useDispatch()
  const galleryEl = useRef<HTMLDivElement>(null)
  const [selectedStreet, setSelectedStreet] = useState<string | null>(
    currentStreetId
  )

  useLayoutEffect(() => {
    if (selectedStreet !== undefined) {
      const selectedEl = document.querySelector('.gallery-selected')
      // Make sure the element exists -- sometimes it hasn't rendered yet
      if (selectedEl) {
        // Note: smooth scroll is not supported in all browsers
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: 'nearest' })
        // We need this to prevent scrollIntoView from moving things
        // upward and trying to reveal the hidden scrollbar area
        if (galleryEl.current?.parentElement) {
          galleryEl.current.parentElement.scrollTop = 0
        }
      }
    }
  }, [selectedStreet])

  function selectStreet (streetId: string): void {
    setSelectedStreet(streetId)
    switchGalleryStreet(streetId)
  }

  function deleteStreet (streetId: string): void {
    if (streetId === currentStreetId) {
      setSelectedStreet(null)
      showError(ERRORS.NO_STREET, false)
    }

    sendDeleteStreetToServer(streetId)

    // Optimistic delete: don't re-fetch, just remove street from memory
    // and let the change in data store trigger a re-render
    dispatch(deleteGalleryStreet(streetId))
  }

  return (
    <>
      {/* Heading */}
      <div className="gallery-header" ref={galleryEl}>
        {user?.id !== undefined && <Avatar userId={user.id} />}
        <div className="gallery-label">
          {user?.displayName ?? user?.id ?? (
            <FormattedMessage id="gallery.all" defaultMessage="All streets" />
          )}
        </div>
        {/* Street count */}
        {user?.id !== undefined && (
          <div className="gallery-street-count">
            <FormattedMessage
              id="gallery.street-count"
              defaultMessage="{count, plural, =0 {No streets yet} one {# street} other {# streets}}"
              values={{ count: streets.length }}
            />
          </div>
        )}
      </div>

      {/* Gallery selection */}
      <div className="gallery-streets-container">
        {/* Display these buttons for a user viewing their own gallery */}
        {isOwnedByCurrentUser && (
          <div className="gallery-user-buttons">
            <Button
              href={URL_NEW_STREET}
              className="gallery-new-street"
              rel="noopener noreferrer"
              target="_blank"
            >
              <FormattedMessage
                id="btn.create"
                defaultMessage="Create new street"
              />
            </Button>
            {selectedStreet !== null
              ? (
                <Button
                  href={URL_NEW_STREET_COPY_LAST}
                  className="gallery-copy-last-street"
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <FormattedMessage id="btn.copy" defaultMessage="Make a copy" />
                </Button>
                )
              : (
                <Button className="gallery-copy-last-street" disabled={true}>
                  <FormattedMessage id="btn.copy" defaultMessage="Make a copy" />
                </Button>
                )}
          </div>
        )}

        <Scrollable className="streets" allowKeyboardScroll={true}>
          {streets.map((item) => (
            <GalleryStreetItem
              key={item.id}
              street={item}
              selected={selectedStreet === item.id}
              doSelect={selectStreet}
              doDelete={deleteStreet}
              showStreetOwner={!user || !(user?.id === item.creatorId)}
              allowDelete={isOwnedByCurrentUser}
            />
          ))}
        </Scrollable>
      </div>
    </>
  )
}

export default GalleryContents
