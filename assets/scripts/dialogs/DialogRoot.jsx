import React from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

// Import all dialogs here
import AboutDialog from './AboutDialog'
import DonateDialog from './DonateDialog'
import FeatureFlagDialog from './FeatureFlagDialog'
import GeotagDialog from './GeotagDialog'
import SaveAsImageDialog from './SaveAsImageDialog'
import SignInDialog from './SignInDialog'
import WhatsNewDialog from './WhatsNewDialog'
import MinecraftDialog from './MinecraftDialog'

const DIALOG_COMPONENTS = {
  ABOUT: {
    id: AboutDialog
  },
  DONATE: {
    id: DonateDialog,
    disableShieldExit: true
  },
  FEATURE_FLAGS: {
    id: FeatureFlagDialog
  },
  GEOTAG: {
    id: GeotagDialog
  },
  SAVE_AS_IMAGE: {
    id: SaveAsImageDialog
  },
  SIGN_IN: {
    id: SignInDialog
  },
  WHATS_NEW: {
    id: WhatsNewDialog
  },
  MINECRAFT: {
    id: MinecraftDialog
  }
}

const DialogRoot = (props) => {
  const { name } = props

  if (!name) return null

  const { id: Dialog, ...restProps } = DIALOG_COMPONENTS[name]

  return <Dialog {...restProps} />
}

DialogRoot.propTypes = {
  name: PropTypes.string
}

export default connect(state => state.dialogs)(DialogRoot)
