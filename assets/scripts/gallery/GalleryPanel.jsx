import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import GalleryError from './GalleryError'
import GalleryLoading from './GalleryLoading'
import GalleryContents from './GalleryContents'
import { repeatReceiveGalleryData } from './view'

// This component only handles switching between display modes
class GalleryPanel extends React.Component {
  static propTypes = {
    mode: PropTypes.string
  }

  constructor (props) {
    super(props)

    this.state = {
      hasError: false
    }
  }

  static getDerivedStateFromError = () => ({
    hasError: true
  })

  render () {
    let childElements

    if (this.state.hasError) {
      childElements = <GalleryError handleRetry={repeatReceiveGalleryData} />
    } else {
      switch (this.props.mode) {
        case 'LOADING':
          childElements = <GalleryLoading />
          break
        case 'GALLERY':
        default:
          childElements = <GalleryContents />
          break
      }
    }

    return <div className="gallery-panel">{childElements}</div>
  }
}

const mapStateToProps = (state) => ({
  mode: state.gallery.mode
})

export default connect(mapStateToProps)(GalleryPanel)
