import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import GalleryPanel from './GalleryPanel'
import GalleryShield from './GalleryShield'
import { hideGallery } from './view'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import './Gallery.scss'

function GalleryContainer (props) {
  const visible = useSelector((state) => state.gallery.visible)

  useEffect(() => {
    // Only register the esc keybind when Gallery is visible
    if (visible) {
      registerKeypress('esc', hideGallery)
    } else {
      deregisterKeypress('esc', hideGallery)
    }

    // Clean up the keybind when unmounted
    return () => {
      deregisterKeypress('esc', hideGallery)
    }
  }, [visible])

  return (
    <div className="gallery" aria-hidden={!visible}>
      <GalleryPanel />
      <GalleryShield visible={visible} />
    </div>
  )
}

export default GalleryContainer
