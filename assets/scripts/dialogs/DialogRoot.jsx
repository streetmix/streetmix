import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { clearDialogs } from '../store/actions/dialogs'

// Import all dialogs here
import Dialog from './Dialog'
import AboutDialog from './AboutDialog'
import DonateDialog from './DonateDialog'
import FeatureFlagDialog from './FeatureFlagDialog'
import GeotagDialog from './GeotagDialog'
import SaveAsImageDialog from './SaveAsImageDialog'
import SignInDialog from './SignInDialog'

const DIALOG_COMPONENTS = {
  ABOUT: {
    contents: AboutDialog
  },
  DONATE: {
    contents: DonateDialog,
    disableShieldExit: true
  },
  FEATURE_FLAGS: {
    contents: FeatureFlagDialog
  },
  GEOTAG: {
    contents: GeotagDialog
  },
  SAVE_AS_IMAGE: {
    contents: SaveAsImageDialog
  },
  SIGN_IN: {
    contents: SignInDialog
  }
}

const DialogRoot = (props) => {
  const { name, clearDialogs } = props

  if (!name) return null

  const { contents: DialogContents, ...restProps } = DIALOG_COMPONENTS[name]

  return (
    <Dialog {...restProps} closeDialog={clearDialogs}>
      <DialogContents />
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
