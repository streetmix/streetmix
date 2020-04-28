import React from 'react'
import { useSelector } from 'react-redux'
import GalleryError from './GalleryError'
import GalleryLoading from './GalleryLoading'
import GalleryContents from './GalleryContents'
import { repeatReceiveGalleryData } from './view'

// This component only handles switching between display modes
function GalleryPanel (props) {
  const mode = useSelector((state) => state.gallery.mode)

  let childElements

  switch (mode) {
    case 'LOADING':
      childElements = <GalleryLoading />
      break
    case 'ERROR':
      childElements = <GalleryError handleRetry={repeatReceiveGalleryData} />
      break
    case 'GALLERY':
    default:
      childElements = <GalleryContents />
      break
  }

  return <div className="gallery-panel">{childElements}</div>
}

export default GalleryPanel
