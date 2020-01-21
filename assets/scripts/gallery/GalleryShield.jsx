import React from 'react'
import PropTypes from 'prop-types'
import { hideGallery } from './view'
import './GalleryShield.scss'

GalleryShield.propTypes = {
  visible: PropTypes.bool
}

function GalleryShield ({ visible = false }) {
  if (visible) {
    return (
      <div className="gallery-shield" onClick={(e) => hideGallery(false)} />
    )
  }

  return null
}

export default GalleryShield
