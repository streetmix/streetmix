import React from 'react'
import GalleryPanel from './GalleryPanel'
import GalleryShield from './GalleryShield'
import './Gallery.scss'

const GalleryContainer = (props) => {
  return (
    <div className="gallery">
      <GalleryPanel />
      <GalleryShield />
    </div>
  )
}

export default GalleryContainer
