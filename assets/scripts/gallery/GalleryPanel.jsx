import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import GalleryError from './GalleryError'
import GalleryLoading from './GalleryLoading'
import GallerySignInPromo from './GallerySignInPromo'
import GalleryContents from './GalleryContents'
import { repeatReceiveGalleryData, hideGallery } from './view'
import { showDialog } from '../store/actions/dialogs'

// This component only handles switching between display modes
class GalleryPanel extends React.Component {
  static propTypes = {
    // Provided by Redux action creators
    showDialog: PropTypes.func,

    // Provided by Redux state
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

const mapDispatchToProps = {
  showDialog
}

export default connect(mapStateToProps, mapDispatchToProps)(GalleryPanel)
