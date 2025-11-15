import React, { useEffect, useCallback } from 'react'

import { useSelector, useDispatch } from '../store/hooks'
import { closeGallery } from '../store/actions/gallery'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import GalleryPanel from './GalleryPanel'
import GalleryShield from './GalleryShield'
import './Gallery.css'

function Gallery (): React.ReactElement {
  const { visible, instant } = useSelector((state) => state.gallery)
  const dispatch = useDispatch()
  const hide = useCallback(() => {
    dispatch(closeGallery())
  }, [dispatch])

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

  useEffect(() => {
    if (visible) {
      if (instant) {
        document.body.classList.add('gallery-no-move-transition')
      }
      document.body.classList.add('gallery-visible')

      if (instant) {
        window.setTimeout(function () {
          document.body.classList.remove('gallery-no-move-transition')
        }, 0)
      }
    } else {
      if (instant) {
        document.body.classList.add('gallery-no-move-transition')
      }
      document.body.classList.remove('gallery-visible')

      if (instant) {
        window.setTimeout(function () {
          document.body.classList.remove('gallery-no-move-transition')
        }, 0)
      }
    }
  }, [visible, instant])

  return (
    <div className="gallery" aria-hidden={!visible}>
      <GalleryPanel />
      <GalleryShield visible={visible} onClick={hide} />
    </div>
  )
}

export default Gallery
