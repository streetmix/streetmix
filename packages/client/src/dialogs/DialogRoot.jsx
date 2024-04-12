import React from 'react'
import { useSelector } from 'react-redux'
import ErrorBoundary from '../util/ErrorBoundary'

// Import all dialogs here
import AboutDialog from './AboutDialog'
import AnalyticsDialog from './AnalyticsDialog'
import FeatureFlagDialog from './FeatureFlagDialog'
import GeotagDialog from './GeotagDialog'
import SaveAsImageDialog from './SaveAsImageDialog'
import SettingsDialog from './SettingsDialog'
import SignInDialog from './SignInDialog'
import WhatsNewDialog from './WhatsNewDialog'
import NewsletterDialog from './NewsletterDialog'
import UpgradeDialog from './UpgradeDialog'
import SentimentSurveyDialog from './SentimentSurveyDialog'
import ErrorDialog from './ErrorDialog'

const DIALOG_COMPONENTS = {
  ABOUT: AboutDialog,
  ANALYTICS: AnalyticsDialog,
  FEATURE_FLAGS: FeatureFlagDialog,
  GEOTAG: GeotagDialog,
  SAVE_AS_IMAGE: SaveAsImageDialog,
  SETTINGS: SettingsDialog,
  SIGN_IN: SignInDialog,
  WHATS_NEW: WhatsNewDialog,
  NEWSLETTER: NewsletterDialog,
  UPGRADE: UpgradeDialog,
  SENTIMENT_SURVEY: SentimentSurveyDialog
}

function DialogRoot (props) {
  const name = useSelector((state) => state.dialogs.name)

  // Bail if no dialog name is provided
  if (!name) return null

  // Get the dialog we want, then render it
  const Dialog = DIALOG_COMPONENTS[name]

  // Wrap Dialog with an ErrorBoundary wrapper to catch errors
  return (
    <ErrorBoundary fallbackElement={<ErrorDialog />}>
      <Dialog />
    </ErrorBoundary>
  )
}

export default DialogRoot
