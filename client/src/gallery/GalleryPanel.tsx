import React from 'react'

import { useSelector } from '../store/hooks'
import { useGetUserQuery } from '../store/services/api'
import GalleryError from './GalleryError'
import GalleryLoading from './GalleryLoading'
import GalleryContents from './GalleryContents'

// This component only handles switching between display modes
function GalleryPanel (): React.ReactElement {
  // Mode is set in state after streets have loaded
  // We use RTK Query to load user data in this component
  // There might be a better way of combining these requests!
  const mode = useSelector((state) => state.gallery.mode)
  const userId = useSelector((state) => state.gallery.userId)
  const { data, isError, isLoading } = useGetUserQuery(userId)

  let childElements

  if (mode === 'loading' || isLoading) {
    childElements = <GalleryLoading />
  } else if (mode === 'error' || isError) {
    childElements = <GalleryError />
  } else if (mode === 'gallery') {
    // It is not necessary to have a user property to load the gallery
    childElements = <GalleryContents user={data} />
  } else {
    childElements = null
  }

  return <div className="gallery-panel">{childElements}</div>
}

export default GalleryPanel
