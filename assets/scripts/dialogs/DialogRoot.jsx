import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

// Import all dialogs here
import AboutDialog from './AboutDialog'
import SaveAsImageDialog from './SaveAsImageDialog'
import DonateDialog from './DonateDialog'
import GeolocateDialog from './GeolocateDialog'

const DIALOG_COMPONENTS = {
  ABOUT: AboutDialog,
  SAVE_AS_IMAGE: SaveAsImageDialog,
  DONATE: DonateDialog,
  GEOLOCATE: GeolocateDialog
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
