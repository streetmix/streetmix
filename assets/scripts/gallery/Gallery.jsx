import React, { useEffect, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import GalleryPanel from './GalleryPanel'
import GalleryShield from './GalleryShield'
import { hideGallery } from '../store/actions/gallery'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import './Gallery.scss'

function Gallery (props) {
  const visible = useSelector((state) => state.gallery.visible)
  const dispatch = useDispatch()
  const hide = useCallback((e) => dispatch(hideGallery()), [dispatch])

  useEffect(() => {
    // Only register the esc keybind when Gallery is visible
    if (visible) {
      registerKeypress('esc', hide)
    } else {
      deregisterKeypress('esc', hide)
    }

    // Clean up the keybind when unmounted
    return () => {
      deregisterKeypress('esc', hide)
    }
  }, [visible, hide])

  return (
    <div className="gallery" aria-hidden={!visible}>
      <GalleryPanel />
      <GalleryShield visible={visible} onClick={hide} />
    </div>
  )
}

export default Gallery
