import React from 'react'
import PropTypes from 'prop-types'
import { hideGallery } from './view'
import './GalleryShield.scss'

const GalleryShield = ({ visible = false }) => visible && (
  <div
    className="gallery-shield"
    onClick={(e) => hideGallery(false)}
  />
)

GalleryShield.propTypes = {
  visible: PropTypes.bool
}

export default GalleryShield
