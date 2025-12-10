import React from 'react'

import { useSelector } from '../store/hooks'
import ErrorBoundary from '../util/ErrorBoundary'

// Import all dialogs here
import AboutDialog from './About'
import AnalyticsDialog from './Analytics'
import FeatureFlagDialog from './FeatureFlag'
import GeotagDialog from './Geotag'
import { SaveAsImageDialog } from './SaveAsImage'
import SettingsDialog from './Settings'
import SignInDialog from './SignIn'
import WhatsNewDialog from './WhatsNew'
import NewsletterDialog from './Newsletter'
import UpgradeDialog from './Upgrade'
import SentimentSurveyDialog from './SentimentSurvey'
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
  SENTIMENT_SURVEY: SentimentSurveyDialog,
}

function DialogRoot() {
  const name = useSelector((state) => state.dialogs.name)

  // Bail if no dialog name is provided
  if (name === null) return null

  // Get the dialog we want, then render it
  const Dialog = DIALOG_COMPONENTS[name as keyof typeof DIALOG_COMPONENTS]

  // Wrap Dialog with an ErrorBoundary wrapper to catch errors
  return (
    <ErrorBoundary fallbackComponent={<ErrorDialog />}>
      <Dialog />
    </ErrorBoundary>
  )
}

export default DialogRoot
