import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import GalleryLoading from './GalleryLoading'
import GallerySignInPromo from './GallerySignInPromo'
import GalleryError from './GalleryError'
import { repeatReceiveGalleryData, hideGallery } from './view'
import { setGalleryMode } from '../store/actions/gallery'
import { showDialog } from '../store/actions/dialogs'
import GalleryContents from './GalleryContents'

class GalleryPanel extends React.Component {
  static propTypes = {
    // Provided by Redux action creators
    setGalleryMode: PropTypes.func,
    showDialog: PropTypes.func,

    // Provided by Redux state
    mode: PropTypes.string
  }

  componentDidCatch () {
    this.props.setGalleryMode('ERROR')
  }

  render () {
    let childElements

    switch (this.props.mode) {
      // This is currently deprecated; the gallery is only accessible only for
      // a defined user or as a global gallery.
      case 'SIGN_IN_PROMO':
        childElements = (
          <GallerySignInPromo
            hideGallery={hideGallery}
            showDialog={this.props.showDialog}
          />
        )
        break
      case 'LOADING':
        childElements = <GalleryLoading />
        break
      case 'ERROR':
        childElements = <GalleryError retry={repeatReceiveGalleryData} />
        break
      case 'GALLERY':
      default:
        childElements = <GalleryContents />
        break
    }

    return (
      <div className="gallery-panel">
        {childElements}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  mode: state.gallery.mode,
  currentStreetId: state.street.id
})

const mapDispatchToProps = {
  setGalleryMode,
  showDialog
}

export default connect(mapStateToProps, mapDispatchToProps)(GalleryPanel)
