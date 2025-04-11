import React from 'react'

import { useSelector } from '../store/hooks'
import ErrorBoundary from '../util/ErrorBoundary'

// Import all dialogs here
import AboutDialog from './About'
import AnalyticsDialog from './Analytics'
import FeatureFlagDialog from './FeatureFlag'
import GeotagDialog from './Geotag'
import NewsletterDialog from './Newsletter'
import NewStreetDialog from './NewStreet'
import SaveAsImageDialog from './SaveAsImage'
import SentimentSurveyDialog from './SentimentSurvey'
import SettingsDialog from './Settings'
import SignInDialog from './SignIn'
import UpgradeDialog from './Upgrade'
import WhatsNewDialog from './WhatsNew'
import ErrorDialog from './ErrorDialog'

const DIALOG_COMPONENTS = {
  ABOUT: AboutDialog,
  ANALYTICS: AnalyticsDialog,
  FEATURE_FLAGS: FeatureFlagDialog,
  GEOTAG: GeotagDialog,
  NEWSLETTER: NewsletterDialog,
  NEW_STREET: NewStreetDialog,
  SAVE_AS_IMAGE: SaveAsImageDialog,
  SENTIMENT_SURVEY: SentimentSurveyDialog,
  SETTINGS: SettingsDialog,
  SIGN_IN: SignInDialog,
  UPGRADE: UpgradeDialog,
  WHATS_NEW: WhatsNewDialog
}

function DialogRoot (): React.ReactElement | null {
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
