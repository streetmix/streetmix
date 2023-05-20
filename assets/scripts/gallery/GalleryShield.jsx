import React from 'react'
import PropTypes from 'prop-types'
import './GalleryShield.scss'

// The Gallery 'Shield' renders across the entire screen behind the gallery
// and creates a space for the user to click to dismiss the gallery
// very similar to a modal

function GalleryShield ({ visible = false, onClick = () => {} }) {
  if (visible) {
    return (
      <div
        className="gallery-shield"
        data-testid="gallery-shield"
        onClick={onClick}
      />
    )
  }

  return null
}

GalleryShield.propTypes = {
  visible: PropTypes.bool,
  onClick: PropTypes.func
}

export default GalleryShield
