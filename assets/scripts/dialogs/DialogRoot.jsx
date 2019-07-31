import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'

// Import all dialogs here
import AboutDialog from './AboutDialog'
import AnalyticsDialog from './AnalyticsDialog'
import DonateDialog from './DonateDialog'
import FeatureFlagDialog from './FeatureFlagDialog'
import GeotagDialog from './GeotagDialog'
import SaveAsImageDialog from './SaveAsImageDialog'
import SignInDialog from './SignInDialog'
import WhatsNewDialog from './WhatsNewDialog'
import MinecraftDialog from './MinecraftDialog'
import NewsletterDialog from './NewsletterDialog'
import UpgradeDialog from './UpgradeDialog'
import ErrorDialog from './ErrorDialog'

const DIALOG_COMPONENTS = {
  ABOUT: {
    id: AboutDialog
  },
  ANALYTICS: {
    id: AnalyticsDialog
  },
  DONATE: {
    id: DonateDialog
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
  },
  NEWSLETTER: {
    id: NewsletterDialog
  },
  UPGRADE: {
    id: UpgradeDialog
  }
}

class DialogRoot extends Component {
  static propTypes = {
    name: PropTypes.string
  }

  state = {
    error: false
  }

  static getDerivedStateFromError () {
    return {
      error: true
    }
  }

  resetError = () => {
    this.setState({
      error: false
    })
  }

  render () {
    const { name } = this.props

    // Bail if no dialog name is provided
    if (!name) return null

    // If there is an error, display the error dialog and
    // give it a function to reset state when it closes
    if (this.state.error) return <ErrorDialog reset={this.resetError} />

    // Get the dialog we want, then render it
    try {
      const { id: Dialog } = DIALOG_COMPONENTS[name]
      return <Dialog />
    } catch (err) {
      // Render the error dialog if we are unable to find the dialog
      console.error('[DialogRoot]', `Unable to find dialog id \`${name}\``)
      return <ErrorDialog reset={this.resetError} />
    }
  }
}

export default connect(state => state.dialogs)(DialogRoot)
