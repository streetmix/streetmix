import React from 'react'

import './GalleryShield.css'

interface GalleryShieldProps {
  visible: boolean
  onClick: React.MouseEventHandler
}

// The Gallery 'Shield' renders across the entire screen behind the gallery
// and creates a space for the user to click to dismiss the gallery
// very similar to a modal

function GalleryShield({ visible = false, onClick }: GalleryShieldProps) {
  return visible ? (
    <div
      className="gallery-shield"
      data-testid="gallery-shield"
      onClick={onClick}
    />
  ) : null
}

export default GalleryShield
