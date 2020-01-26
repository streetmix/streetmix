import React from 'react'
import PropTypes from 'prop-types'
import './GalleryShield.scss'

GalleryShield.propTypes = {
  visible: PropTypes.bool,
  onClick: PropTypes.func
}

function GalleryShield ({ visible = false, onClick = () => {} }) {
  if (visible) {
    return <div className="gallery-shield" onClick={onClick} />
  }

  return null
}

export default GalleryShield
