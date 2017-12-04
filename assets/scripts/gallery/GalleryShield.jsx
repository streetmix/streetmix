import React from 'react'
import { hideGallery } from './view'

export default class GalleryShield extends React.Component {
  onClick (event) {
    hideGallery(false)
  }

  render () {
    return (
      <div className="gallery-shield" onClick={this.onClick} />
    )
  }
}
