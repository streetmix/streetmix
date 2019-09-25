import React, { useEffect } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import GalleryPanel from './GalleryPanel'
import GalleryShield from './GalleryShield'
import { hideGallery } from './view'
import { registerKeypress, deregisterKeypress } from '../app/keypress'
import './Gallery.scss'

const GalleryContainer = ({ visible }) => {
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

GalleryContainer.propTypes = {
  visible: PropTypes.bool
}

const mapStateToProps = (state) => ({
  visible: state.gallery.visible
})

export default connect(mapStateToProps)(GalleryContainer)
