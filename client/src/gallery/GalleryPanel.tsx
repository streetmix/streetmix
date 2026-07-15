import { useRef } from 'react'
import { FormattedMessage } from 'react-intl'

import { useSelector } from '../store/hooks.js'
import { useGetUserQuery } from '../store/services/api.js'
import { Avatar } from '../users/Avatar.js'
import { GalleryError } from './GalleryError.js'
import { GalleryLoading } from './GalleryLoading.js'
import { GalleryContents } from './GalleryContents.js'
import { GalleryPagination } from './GalleryPagination.js'
import { GallerySearch } from './GallerySearch.js'

export function GalleryPanel() {
  const { mode, userId } = useSelector((state) => state.gallery)
  const gallerySearch = useSelector(
    (state) => state.flags.GALLERY_SEARCH.value ?? false
  )

  const { data: user, isError, isLoading } = useGetUserQuery(userId)

  const galleryEl = useRef<HTMLDivElement>(null)

  let childElements

  if (mode === 'loading' || isLoading) {
    childElements = <GalleryLoading />
  } else if (mode === 'error' || isError) {
    childElements = <GalleryError />
  } else if (mode === 'gallery') {
    // It is not necessary to have a user property to load the gallery
    childElements = <GalleryContents ref={galleryEl} user={user} />
  } else {
    childElements = null
  }

  return (
    <div className="gallery-panel">
      <div className="gallery-header" ref={galleryEl}>
        <div className="gallery-label">
          {user?.id !== undefined && <Avatar userId={user.id} />}
          {user?.displayName ?? user?.id ?? (
            <FormattedMessage id="gallery.all" defaultMessage="All streets" />
          )}
        </div>
        <div className="gallery-search">
          {gallerySearch && <GallerySearch />}
        </div>
        <div className="gallery-street-count">
          <GalleryPagination isLoading={mode === 'loading' || isLoading} />
        </div>
      </div>
      <div className="gallery-streets-container">{childElements}</div>
    </div>
  )
}
