import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import GalleryPanel from './GalleryPanel'
import GalleryShield from './GalleryShield'
import './Gallery.scss'

const GalleryContainer = ({ visible }) => (
  <div className="gallery">
    <GalleryPanel />
    <GalleryShield visible={visible} />
  </div>
)

GalleryContainer.propTypes = {
  visible: PropTypes.bool
}

const mapStateToProps = (state) => ({
  visible: state.gallery.visible
})

export default connect(mapStateToProps)(GalleryContainer)
