import React from 'react'
import LoadingSpinner from '../ui/LoadingSpinner'

const GalleryLoading = (props) => (
  <div className="gallery-loading" aria-live="polite" aria-busy="true">
    <LoadingSpinner />
  </div>
)

export default GalleryLoading
