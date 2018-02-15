import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

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

const DialogRoot = ({ name, props }) => {
  if (!name) return null

  const SpecificDialog = DIALOG_COMPONENTS[name].component

  return (
    <Dialog {...DIALOG_COMPONENTS[name].props}>
      <SpecificDialog {...props} />
    </Dialog>
  )
}

DialogRoot.propTypes = {
  name: PropTypes.string,
  props: PropTypes.object
}

export default connect(
  state => state.dialogs
)(DialogRoot)
