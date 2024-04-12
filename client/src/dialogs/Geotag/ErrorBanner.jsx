import React from 'react'
import { FormattedMessage } from 'react-intl'

function ErrorBanner (props) {
  return (
    <div className="geotag-error-banner">
      <FormattedMessage
        id="dialogs.geotag.geotag-unavailable"
        defaultMessage="Geocoding services are currently unavailable. You can view the map,
            but you won’t be able to change this street’s location."
      />
    </div>
  )
}

export default ErrorBanner
