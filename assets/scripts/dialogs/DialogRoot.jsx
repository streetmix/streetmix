import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { clearDialogs } from '../store/actions/dialogs'

// Import all dialogs here
import Dialog from './Dialog'
import AboutDialog from './AboutDialog'
import DonateDialog from './DonateDialog'
import FeatureFlagDialog from './FeatureFlagDialog'
import GeolocateDialog from './GeolocateDialog'
import SaveAsImageDialog from './SaveAsImageDialog'

const DIALOG_COMPONENTS = {
  ABOUT: {
    component: AboutDialog,
    props: {
      className: 'about-dialog'
    }
  },
  DONATE: {
    component: DonateDialog,
    props: {
      className: 'donate-dialog',
      disableShieldExit: true
    }
  },
  FEATURE_FLAGS: {
    component: FeatureFlagDialog,
    props: {
      className: 'feature-flag-dialog'
    }
  },
  GEOLOCATE: {
    component: GeolocateDialog,
    props: {
      className: 'geolocate-dialog'
    }
  },
  SAVE_AS_IMAGE: {
    component: SaveAsImageDialog,
    props: {
      className: 'save-as-image-dialog'
    }
  }
}

const DialogRoot = ({ name, clearDialogs }) => {
  if (!name) return null

  const SpecificDialog = DIALOG_COMPONENTS[name].component

  return (
    <Dialog {...DIALOG_COMPONENTS[name].props} closeDialog={clearDialogs}>
      <SpecificDialog />
    </Dialog>
  )
}

DialogRoot.propTypes = {
  name: PropTypes.string,
  clearDialogs: PropTypes.func
}

const mapDispatchToProps = (dispatch) => {
  return {
    clearDialogs: () => { dispatch(clearDialogs()) }
  }
}

export default connect(
  state => state.dialogs,
  mapDispatchToProps
)(DialogRoot)
