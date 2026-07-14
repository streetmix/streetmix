import React, { useRef, useState, useLayoutEffect } from 'react'

import { useSelector, useDispatch } from '../store/hooks.js'
import { deleteGalleryStreet } from '../store/slices/gallery.js'
import { Scrollable } from '../ui/Scrollable.js'
import { sendDeleteStreetToServer } from '../streets/xhr.js'
import { showError, ERRORS } from '../app/errors.js'
import { GalleryStreetItem } from './GalleryStreetItem.js'
import { switchGalleryStreet } from './index.js'

import type { UserProfile } from '../types'
import './GalleryContents.css'

interface GalleryContentsProps {
  ref: React.RefObject<HTMLDivElement | null>
  user?: UserProfile
}

export function GalleryContents({ ref, user }: GalleryContentsProps) {
  const streets = useSelector((state) => state.gallery.streets)
  const currentStreetId = useSelector((state) => state.street.id ?? null)
  const isOwnedByCurrentUser = useSelector(
    (state) =>
      state.user.signedIn &&
      state.gallery.userId === state.user.signInData?.userId
  )
  const dispatch = useDispatch()
  const centerOnFirstRender = useRef(true)
  const [selectedStreet, setSelectedStreet] = useState<string | null>(
    currentStreetId
  )

  useLayoutEffect(() => {
    if (selectedStreet !== undefined) {
      const selectedEl = document.querySelector('.gallery-selected')
      // Make sure the element exists -- sometimes it hasn't rendered yet,
      // or it's on another page.
      if (selectedEl) {
        // Center the selected item when the view is first programatically
        // rendered. Selecting the item manually will only scroll to nearest
        // position to minimize scrolling movement.
        let alignment: ScrollLogicalPosition = 'nearest'
        if (centerOnFirstRender.current === true) {
          alignment = 'center'
          centerOnFirstRender.current = false
        }
        selectedEl.scrollIntoView({ behavior: 'smooth', inline: alignment })

        // We need this to prevent scrollIntoView from moving things
        // upward and trying to reveal the hidden scrollbar area
        if (ref.current?.parentElement) {
          ref.current.parentElement.scrollTop = 0
        }
      }
    }
  }, [ref, selectedStreet])

  function selectStreet(streetId: string): void {
    centerOnFirstRender.current = false
    setSelectedStreet(streetId)
    switchGalleryStreet(streetId)
  }

  function deleteStreet(streetId: string): void {
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
    <Scrollable className="streets" allowKeyboardScroll>
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
  )
}
