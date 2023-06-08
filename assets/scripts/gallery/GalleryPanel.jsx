import React from 'react'
import { useSelector } from 'react-redux'
import { useGetUserQuery } from '../store/services/api'
import GalleryError from './GalleryError'
import GalleryLoading from './GalleryLoading'
import GalleryContents from './GalleryContents'

// This component only handles switching between display modes
function GalleryPanel (props) {
  // Mode is set in state after streets have loaded
  // We use RTK Query to load user data in this component
  // There might be a better way of combining these requests!
  const mode = useSelector((state) => state.gallery.mode)
  const userId = useSelector((state) => state.gallery.userId)
  const {
    data: user,
    isError,
    isLoading
  } = useGetUserQuery(userId, {
    // Only queries for user data if `userId` is truthy.
    skip: !userId
  })

  let childElements

  if (mode === 'LOADING' || isLoading) {
    childElements = <GalleryLoading />
  } else if (mode === 'ERROR' || isError) {
    childElements = <GalleryError />
  } else if (mode === 'GALLERY' && user) {
    childElements = <GalleryContents user={user} />
  } else {
    childElements = null
  }

  return <div className="gallery-panel">{childElements}</div>
}

export default GalleryPanel
