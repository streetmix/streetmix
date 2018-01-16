import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

// Import all dialogs here
import AboutDialog from './AboutDialog'
import DonateDialog from './DonateDialog'
import FeatureFlagDialog from './FeatureFlagDialog'
import GeolocateDialog from './GeolocateDialog'
import SaveAsImageDialog from './SaveAsImageDialog'

const DIALOG_COMPONENTS = {
  ABOUT: AboutDialog,
  DONATE: DonateDialog,
  FEATURE_FLAGS: FeatureFlagDialog,
  GEOLOCATE: GeolocateDialog,
  SAVE_AS_IMAGE: SaveAsImageDialog
}

const DialogRoot = ({ name, props }) => {
  if (!name) return null

  const SpecificDialog = DIALOG_COMPONENTS[name]
  return <SpecificDialog {...props} />
}

DialogRoot.propTypes = {
  name: PropTypes.string,
  props: PropTypes.object
}

export default connect(
  state => state.dialogs
)(DialogRoot)
